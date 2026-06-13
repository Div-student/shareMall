import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../../database/entities/address.entity';
import { CreateAddressDto } from './dto';

@Injectable()
export class AddressService {
  constructor(@InjectRepository(AddressEntity) private readonly addresses: Repository<AddressEntity>) {}

  async list(userId: string) {
    const rows = await this.addresses.find({
      where: { userId },
      order: { isDefault: 'DESC', id: 'DESC' },
    });
    return {
      list: rows.map((a) => this.toVo(a)),
    };
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.addresses.update({ userId }, { isDefault: false });
    }

    const count = await this.addresses.count({ where: { userId } });
    const saved = await this.addresses.save(
      this.addresses.create({
        userId,
        receiver: dto.receiver,
        phone: dto.phone,
        province: dto.province,
        city: dto.city,
        district: dto.district,
        detail: dto.detail,
        isDefault: dto.isDefault ?? count === 0,
      }),
    );
    return this.toVo(saved);
  }

  async getDefault(userId: string) {
    const addr = await this.addresses.findOne({ where: { userId, isDefault: true } });
    if (addr) return this.toVo(addr);
    const first = await this.addresses.findOne({ where: { userId }, order: { id: 'ASC' } });
    if (!first) throw new NotFoundException('暂无收货地址');
    return this.toVo(first);
  }

  private toVo(address: AddressEntity) {
    return {
      id: Number(address.id),
      receiver: address.receiver,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      isDefault: address.isDefault,
      fullAddress: `${address.province}${address.city}${address.district}${address.detail}`,
    };
  }
}
