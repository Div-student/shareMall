import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CartItemEntity } from '../../database/entities/cart-item.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { ProductEntity } from '../../database/entities/product.entity';
import { SkuEntity } from '../../database/entities/sku.entity';
import { AddCartDto, UpdateCartDto } from './dto';

const DEFAULT_FUND_RATIO = 0.1;

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItemEntity) private readonly cartItems: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
    @InjectRepository(SkuEntity) private readonly skus: Repository<SkuEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
  ) {}

  async list(userId: string) {
    const rows = await this.cartItems.find({
      where: { userId },
      order: { id: 'DESC' },
    });

    let totalAmount = 0;
    let totalFund = 0;
    const items: {
      id: number;
      productId: number;
      skuId: number;
      title: string;
      mainImage: string;
      spec: Record<string, string>;
      price: number;
      quantity: number;
      checked: boolean;
      stock: number;
      fundAmount: number;
      lineAmount: number;
    }[] = [];

    for (const row of rows) {
      const product = await this.products.findOne({
        where: { id: row.productId, status: 'on_sale', deletedAt: IsNull() },
      });
      if (!product) continue;

      const sku = row.skuId
        ? await this.skus.findOne({ where: { id: row.skuId, productId: product.id } })
        : await this.skus.findOne({ where: { productId: product.id }, order: { id: 'ASC' } });
      if (!sku) continue;

      const category = await this.categories.findOne({ where: { id: product.categoryId } });
      const price = Number(sku.price);
      const fundRatio = this.resolveFundRatio(product.fundRatio, category?.fundRatio);
      const lineAmount = this.roundMoney(price * row.quantity);
      const lineFund = this.roundMoney(lineAmount * fundRatio);

      totalAmount = this.roundMoney(totalAmount + lineAmount);
      totalFund = this.roundMoney(totalFund + lineFund);

      items.push({
        id: Number(row.id),
        productId: Number(product.id),
        skuId: Number(sku.id),
        title: product.title,
        mainImage: sku.skuImage ?? product.mainImage,
        spec: sku.spec,
        price,
        quantity: row.quantity,
        checked: row.checked,
        stock: sku.stock,
        fundAmount: this.roundMoney(price * fundRatio),
        lineAmount,
      });
    }

    return { items, totalAmount, totalFund };
  }

  async add(userId: string, dto: AddCartDto) {
    const product = await this.products.findOne({
      where: { id: String(dto.productId), status: 'on_sale', deletedAt: IsNull() },
    });
    if (!product) throw new NotFoundException('商品不存在或已下架');

    let skuId = dto.skuId ? String(dto.skuId) : undefined;
    if (!skuId) {
      const defaultSku = await this.skus.findOne({
        where: { productId: product.id },
        order: { id: 'ASC' },
      });
      if (!defaultSku) throw new BadRequestException('商品规格不可用');
      skuId = defaultSku.id;
    }

    const sku = await this.skus.findOne({ where: { id: skuId, productId: product.id } });
    if (!sku) throw new NotFoundException('规格不存在');
    if (sku.stock < dto.quantity) throw new BadRequestException('库存不足');

    const existing = await this.cartItems.findOne({
      where: { userId, productId: product.id, skuId: sku.id },
    });

    if (existing) {
      const nextQty = existing.quantity + dto.quantity;
      if (sku.stock < nextQty) throw new BadRequestException('库存不足');
      existing.quantity = nextQty;
      await this.cartItems.save(existing);
      return { id: Number(existing.id) };
    }

    const saved = await this.cartItems.save(
      this.cartItems.create({
        userId,
        productId: product.id,
        skuId: sku.id,
        quantity: dto.quantity,
        checked: true,
      }),
    );
    return { id: Number(saved.id) };
  }

  async update(userId: string, id: string, dto: UpdateCartDto) {
    const item = await this.cartItems.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('购物车项不存在');

    const sku = await this.skus.findOne({
      where: { id: item.skuId ?? '', productId: item.productId },
    });
    if (!sku) throw new NotFoundException('规格不存在');
    if (sku.stock < dto.quantity) throw new BadRequestException('库存不足');

    item.quantity = dto.quantity;
    await this.cartItems.save(item);
    return { success: true };
  }

  async remove(userId: string, id: string) {
    const item = await this.cartItems.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('购物车项不存在');
    await this.cartItems.remove(item);
    return { success: true };
  }

  private resolveFundRatio(productRatio?: string | null, categoryRatio?: string | null) {
    if (productRatio != null) return Number(productRatio);
    if (categoryRatio != null) return Number(categoryRatio);
    return DEFAULT_FUND_RATIO;
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }
}
