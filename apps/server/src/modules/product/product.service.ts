import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, In, Like, Repository } from 'typeorm';
import { BannerEntity } from '../../database/entities/banner.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { ProductEntity } from '../../database/entities/product.entity';
import { SkuEntity } from '../../database/entities/sku.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderItemEntity } from '../../database/entities/order-item.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { OrderFeedConfigService } from './order-feed-config.service';
import {
  AdminCreateCategoryDto,
  AdminUpdateCategoryDto,
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
    @InjectRepository(OrderItemEntity) private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly orderFeedConfig: OrderFeedConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.products.count();
    if (count === 0) {
      await this.seedSampleData();
      return;
    }
    await this.backfillProductGalleries();
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

  async listCategories() {
    const all = await this.categories.find({
      where: { status: 'show' },
      order: { sort: 'DESC', id: 'ASC' },
    });
    const roots = all.filter((c) => c.parentId === '0');
    return {
      list: roots.map((root) => ({
        id: Number(root.id),
        name: root.name,
        icon: root.icon,
        children: all
          .filter((c) => c.parentId === root.id)
          .map((c) => ({
            id: Number(c.id),
            name: c.name,
          })),
      })),
    };
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
      images: this.normalizeProductImages(product.mainImage, product.images),
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

  async getOrderFeed(id: string) {
    const product = await this.products.findOne({ where: { id, deletedAt: IsNull() } });
    if (!product) throw new NotFoundException('商品不存在');

    const rules = await this.orderFeedConfig.getRules();
    if (!rules.enabled) return { list: [] };

    const paidStatuses = ['paid', 'shipped', 'received', 'completed'];
    const rows = await this.orderItems
      .createQueryBuilder('oi')
      .innerJoin(OrderEntity, 'o', 'o.id = oi.order_id')
      .innerJoin(UserEntity, 'u', 'u.id = o.user_id')
      .select('u.phone', 'phone')
      .addSelect('o.created_at', 'createdAt')
      .where('oi.product_id = :productId', { productId: id })
      .andWhere('o.status IN (:...statuses)', { statuses: paidStatuses })
      .orderBy('o.created_at', 'DESC')
      .take(20)
      .getRawMany<{ phone: string; createdAt: Date }>();

    const list = rows.map((row) => ({
      text: `用户${this.maskPhone(row.phone)}刚刚下单了本商品`,
      time: row.createdAt,
    }));

    while (list.length < rules.minDisplay) {
      const template = rules.mockTemplates[list.length % rules.mockTemplates.length] ?? rules.mockTemplates[0];
      list.push({
        text: template.replace('{phone}', this.randomMaskedPhone()),
        time: new Date(Date.now() - (list.length + 1) * 60000),
      });
    }

    return { list: list.slice(0, rules.minDisplay) };
  }

  private maskPhone(phone: string) {
    if (!phone || phone.length < 7) return '***';
    return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
  }

  private randomMaskedPhone() {
    const prefix = ['138', '139', '158', '186'][Math.floor(Math.random() * 4)];
    const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${prefix}****${suffix}`;
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

  async adminUpdateCategory(id: string, dto: AdminUpdateCategoryDto) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) throw new NotFoundException('分类不存在');
    if (dto.name != null) category.name = dto.name;
    if (dto.icon != null) category.icon = dto.icon;
    if (dto.fundRatio != null) category.fundRatio = String(dto.fundRatio);
    if (dto.sort != null) category.sort = dto.sort;
    if (dto.status != null) category.status = dto.status;
    await this.categories.save(category);
    return {
      id: Number(category.id),
      parentId: Number(category.parentId),
      name: category.name,
      icon: category.icon,
      fundRatio: category.fundRatio ? Number(category.fundRatio) : null,
      sort: category.sort,
      status: category.status,
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
    } else if (query.parentCategoryId) {
      const children = await this.categories.find({
        where: { parentId: String(query.parentCategoryId), status: 'show' },
        select: ['id'],
      });
      const categoryIds = [String(query.parentCategoryId), ...children.map((c) => c.id)];
      qb.andWhere('p.category_id IN (:...categoryIds)', { categoryIds });
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

    await this.categories.save([
      this.categories.create({ name: '手机', parentId: categories[0].id, sort: 2 }),
      this.categories.create({ name: '耳机', parentId: categories[0].id, sort: 1 }),
      this.categories.create({ name: '护肤', parentId: categories[1].id, sort: 2 }),
      this.categories.create({ name: '彩妆', parentId: categories[1].id, sort: 1 }),
      this.categories.create({ name: '灯具', parentId: categories[2].id, sort: 2 }),
      this.categories.create({ name: '收纳', parentId: categories[2].id, sort: 1 }),
      this.categories.create({ name: '零食', parentId: categories[3].id, sort: 2 }),
      this.categories.create({ name: '饮品', parentId: categories[3].id, sort: 1 }),
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
        imageSeed: 'p1',
        price: '299.00',
        fundRatio: '0.15',
        sales: 128,
      },
      {
        title: '保湿护肤套装',
        categoryId: categories[1].id,
        imageSeed: 'p2',
        price: '199.00',
        fundRatio: '0.12',
        sales: 256,
      },
      {
        title: '北欧简约台灯',
        categoryId: categories[2].id,
        imageSeed: 'p3',
        price: '89.00',
        sales: 89,
      },
      {
        title: '有机坚果礼盒',
        categoryId: categories[3].id,
        imageSeed: 'p4',
        price: '128.00',
        fundRatio: '0.08',
        sales: 512,
      },
    ];

    for (const item of samples) {
      const images = this.buildGalleryImages(item.imageSeed);
      const product = await this.products.save(
        this.products.create({
          title: item.title,
          categoryId: item.categoryId,
          mainImage: images[0],
          images,
          price: item.price,
          fundRatio: item.fundRatio,
          sales: item.sales,
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

  /** 生成 4 张轮播图（与设计稿一致） */
  private buildGalleryImages(seed: string): string[] {
    return [1, 2, 3, 4].map((i) => `https://picsum.photos/seed/${seed}-${i}/400`);
  }

  /** 主图置顶并去重 */
  private normalizeProductImages(mainImage: string, images?: string[] | null): string[] {
    const merged: string[] = [];
    const seen = new Set<string>();
    for (const url of [mainImage, ...(images ?? [])]) {
      if (url && !seen.has(url)) {
        seen.add(url);
        merged.push(url);
      }
    }
    return merged.length ? merged : mainImage ? [mainImage] : [];
  }

  /** 为仅有单图的示例商品补全轮播图 */
  private async backfillProductGalleries() {
    const list = await this.products.find();
    for (const product of list) {
      if ((product.images?.length ?? 0) > 1) continue;
      const match = product.mainImage.match(/seed\/([^/]+)/);
      if (!match) continue;
      const baseSeed = match[1].replace(/-\d+$/, '');
      product.images = this.buildGalleryImages(baseSeed);
      await this.products.save(product);
    }
  }
}
