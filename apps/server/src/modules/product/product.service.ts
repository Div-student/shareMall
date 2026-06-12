import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, In, Like, Repository } from 'typeorm';
import { BannerEntity } from '../../database/entities/banner.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { ProductEntity } from '../../database/entities/product.entity';
import { SkuEntity } from '../../database/entities/sku.entity';
import {
  AdminCreateCategoryDto,
  AdminCreateProductDto,
  AdminProductListQueryDto,
  AdminUpdateProductDto,
  ProductListQueryDto,
} from './dto';

/** 全局默认贡献金比例（后续改读 config 表） */
const DEFAULT_FUND_RATIO = 0.1;

@Injectable()
export class ProductService implements OnModuleInit {
  constructor(
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(SkuEntity) private readonly skus: Repository<SkuEntity>,
    @InjectRepository(BannerEntity) private readonly banners: Repository<BannerEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.products.count();
    if (count === 0) {
      await this.seedSampleData();
    }
  }

  async getHome() {
    const [banners, categories, productList] = await Promise.all([
      this.banners.find({ order: { sort: 'DESC', id: 'DESC' }, take: 5 }),
      this.categories.find({
        where: { status: 'show', parentId: '0' },
        order: { sort: 'DESC', id: 'ASC' },
        take: 8,
      }),
      this.findOnSaleProducts({ page: 1, pageSize: 10, sort: 'default' }),
    ]);

    return {
      banners: banners.map((b) => ({
        id: Number(b.id),
        image: b.image,
        link: b.link,
      })),
      categories: categories.map((c) => ({
        id: Number(c.id),
        name: c.name,
        icon: c.icon,
      })),
      products: productList.list,
    };
  }

  async listProducts(query: ProductListQueryDto) {
    return this.findOnSaleProducts(query);
  }

  async getProductDetail(id: string) {
    const product = await this.products.findOne({
      where: { id, status: 'on_sale', deletedAt: IsNull() },
    });
    if (!product) throw new NotFoundException('商品不存在或已下架');

    const [category, skuList] = await Promise.all([
      this.categories.findOne({ where: { id: product.categoryId } }),
      this.skus.find({ where: { productId: product.id }, order: { id: 'ASC' } }),
    ]);

    const price = Number(product.price);
    const fundRatio = this.resolveFundRatio(product.fundRatio, category?.fundRatio);

    return {
      id: Number(product.id),
      title: product.title,
      mainImage: product.mainImage,
      images: product.images?.length ? product.images : [product.mainImage],
      detailHtml: product.detailHtml ?? '',
      price,
      marketPrice: product.marketPrice ? Number(product.marketPrice) : null,
      fundRatio,
      fundAmount: this.calcFundAmount(price, fundRatio),
      allowFundDeduct: product.allowFundDeduct,
      deductLimitRate: product.deductLimitRate ? Number(product.deductLimitRate) : null,
      sales: product.sales,
      categoryId: Number(product.categoryId),
      skus: skuList.map((s) => ({
        id: Number(s.id),
        spec: s.spec,
        price: Number(s.price),
        stock: s.stock,
        skuImage: s.skuImage,
      })),
    };
  }

  getOrderFeed(_id: string) {
    return { list: [] };
  }

  async adminListProducts(query: AdminProductListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Record<string, unknown> = { deletedAt: IsNull() };
    if (query.status) where.status = query.status;
    if (query.keyword) where.title = Like(`%${query.keyword}%`);

    const [rows, total] = await this.products.findAndCount({
      where,
      order: { sort: 'DESC', id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const categoryMap = await this.loadCategoryMap(rows.map((p) => p.categoryId));

    return {
      list: rows.map((p) => this.toAdminProductVo(p, categoryMap.get(p.categoryId))),
      total,
    };
  }

  async adminGetProduct(id: string) {
    const product = await this.products.findOne({ where: { id, deletedAt: IsNull() } });
    if (!product) throw new NotFoundException('商品不存在');
    const category = await this.categories.findOne({ where: { id: product.categoryId } });
    return this.toAdminProductVo(product, category);
  }

  async adminCreateProduct(dto: AdminCreateProductDto) {
    await this.ensureCategory(String(dto.categoryId));
    const saved = await this.products.save(
      this.products.create({
        title: dto.title,
        categoryId: String(dto.categoryId),
        mainImage: dto.mainImage,
        images: dto.images,
        detailHtml: dto.detailHtml,
        price: String(dto.price),
        marketPrice: dto.marketPrice != null ? String(dto.marketPrice) : undefined,
        fundRatio: dto.fundRatio != null ? String(dto.fundRatio) : undefined,
        allowFundDeduct: dto.allowFundDeduct ?? true,
        status: dto.status ?? 'off_shelf',
        sort: dto.sort ?? 0,
      }),
    );
    return this.adminGetProduct(saved.id);
  }

  async adminUpdateProduct(id: string, dto: AdminUpdateProductDto) {
    const product = await this.products.findOne({ where: { id, deletedAt: IsNull() } });
    if (!product) throw new NotFoundException('商品不存在');
    if (dto.categoryId != null) await this.ensureCategory(String(dto.categoryId));

    if (dto.title != null) product.title = dto.title;
    if (dto.categoryId != null) product.categoryId = String(dto.categoryId);
    if (dto.mainImage != null) product.mainImage = dto.mainImage;
    if (dto.images != null) product.images = dto.images;
    if (dto.detailHtml != null) product.detailHtml = dto.detailHtml;
    if (dto.price != null) product.price = String(dto.price);
    if (dto.marketPrice != null) product.marketPrice = String(dto.marketPrice);
    if (dto.fundRatio != null) product.fundRatio = String(dto.fundRatio);
    if (dto.allowFundDeduct != null) product.allowFundDeduct = dto.allowFundDeduct;
    if (dto.status != null) product.status = dto.status;
    if (dto.sort != null) product.sort = dto.sort;

    await this.products.save(product);
    return this.adminGetProduct(id);
  }

  async adminListCategories() {
    const list = await this.categories.find({ order: { sort: 'DESC', id: 'ASC' } });
    return {
      list: list.map((c) => ({
        id: Number(c.id),
        parentId: Number(c.parentId),
        name: c.name,
        icon: c.icon,
        fundRatio: c.fundRatio ? Number(c.fundRatio) : null,
        sort: c.sort,
        status: c.status,
      })),
    };
  }

  async adminCreateCategory(dto: AdminCreateCategoryDto) {
    const saved = await this.categories.save(
      this.categories.create({
        name: dto.name,
        icon: dto.icon,
        parentId: String(dto.parentId ?? 0),
        fundRatio: dto.fundRatio != null ? String(dto.fundRatio) : undefined,
        sort: dto.sort ?? 0,
      }),
    );
    return {
      id: Number(saved.id),
      name: saved.name,
    };
  }

  private async findOnSaleProducts(query: ProductListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const qb = this.products
      .createQueryBuilder('p')
      .where('p.status = :status', { status: 'on_sale' })
      .andWhere('p.deleted_at IS NULL');

    if (query.categoryId) {
      qb.andWhere('p.category_id = :categoryId', { categoryId: String(query.categoryId) });
    }
    if (query.keyword) {
      qb.andWhere('p.title LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('p.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('p.price', 'DESC');
        break;
      case 'sales':
        qb.orderBy('p.sales', 'DESC');
        break;
      default:
        qb.orderBy('p.sort', 'DESC').addOrderBy('p.id', 'DESC');
    }

    qb.skip((page - 1) * pageSize).take(pageSize);
    const [rows, total] = await qb.getManyAndCount();
    const categoryMap = await this.loadCategoryMap(rows.map((p) => p.categoryId));

    return {
      list: rows.map((p) => this.toListItem(p, categoryMap.get(p.categoryId))),
      total,
    };
  }

  private toListItem(product: ProductEntity, category?: CategoryEntity) {
    const price = Number(product.price);
    const fundRatio = this.resolveFundRatio(product.fundRatio, category?.fundRatio);
    return {
      id: Number(product.id),
      title: product.title,
      mainImage: product.mainImage,
      price,
      fundAmount: this.calcFundAmount(price, fundRatio),
      sales: product.sales,
    };
  }

  private toAdminProductVo(product: ProductEntity, category?: CategoryEntity | null) {
    return {
      id: Number(product.id),
      title: product.title,
      categoryId: Number(product.categoryId),
      categoryName: category?.name ?? '',
      mainImage: product.mainImage,
      images: product.images ?? [],
      detailHtml: product.detailHtml ?? '',
      price: Number(product.price),
      marketPrice: product.marketPrice ? Number(product.marketPrice) : null,
      fundRatio: product.fundRatio ? Number(product.fundRatio) : null,
      allowFundDeduct: product.allowFundDeduct,
      status: product.status,
      sort: product.sort,
      sales: product.sales,
      createdAt: product.createdAt,
    };
  }

  private resolveFundRatio(productRatio?: string | null, categoryRatio?: string | null) {
    if (productRatio != null) return Number(productRatio);
    if (categoryRatio != null) return Number(categoryRatio);
    return DEFAULT_FUND_RATIO;
  }

  private calcFundAmount(price: number, fundRatio: number) {
    return Math.round(price * fundRatio * 100) / 100;
  }

  private async loadCategoryMap(ids: string[]) {
    const unique = [...new Set(ids)];
    if (!unique.length) return new Map<string, CategoryEntity>();
    const list = await this.categories.find({ where: { id: In(unique) } });
    return new Map(list.map((c) => [c.id, c]));
  }

  private async ensureCategory(id: string) {
    const cat = await this.categories.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('分类不存在');
  }

  private async seedSampleData() {
    const categories = await this.categories.save([
      this.categories.create({ name: '数码', icon: 'https://picsum.photos/seed/cat1/80', sort: 10 }),
      this.categories.create({ name: '美妆', icon: 'https://picsum.photos/seed/cat2/80', sort: 9 }),
      this.categories.create({ name: '家居', icon: 'https://picsum.photos/seed/cat3/80', sort: 8 }),
      this.categories.create({ name: '食品', icon: 'https://picsum.photos/seed/cat4/80', sort: 7 }),
    ]);

    await this.banners.save([
      this.banners.create({
        position: 'home_top',
        image: 'https://picsum.photos/seed/banner1/750/320',
        link: '/home',
        sort: 10,
      }),
      this.banners.create({
        position: 'home_top',
        image: 'https://picsum.photos/seed/banner2/750/320',
        sort: 9,
      }),
    ]);

    const samples = [
      {
        title: '无线蓝牙耳机 Pro',
        categoryId: categories[0].id,
        mainImage: 'https://picsum.photos/seed/p1/400',
        price: '299.00',
        fundRatio: '0.15',
        sales: 128,
      },
      {
        title: '保湿护肤套装',
        categoryId: categories[1].id,
        mainImage: 'https://picsum.photos/seed/p2/400',
        price: '199.00',
        fundRatio: '0.12',
        sales: 256,
      },
      {
        title: '北欧简约台灯',
        categoryId: categories[2].id,
        mainImage: 'https://picsum.photos/seed/p3/400',
        price: '89.00',
        sales: 89,
      },
      {
        title: '有机坚果礼盒',
        categoryId: categories[3].id,
        mainImage: 'https://picsum.photos/seed/p4/400',
        price: '128.00',
        fundRatio: '0.08',
        sales: 512,
      },
    ];

    for (const item of samples) {
      const product = await this.products.save(
        this.products.create({
          ...item,
          images: [item.mainImage],
          detailHtml: `<p>${item.title} — 优质好物，下单即享贡献金回馈。</p>`,
          marketPrice: String(Number(item.price) + 50),
          status: 'on_sale',
          allowFundDeduct: true,
          sort: 10,
        }),
      );
      await this.skus.save(
        this.skus.create({
          productId: product.id,
          spec: { 规格: '默认' },
          price: item.price,
          stock: 999,
        }),
      );
    }
  }
}
