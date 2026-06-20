import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async update(userId: string, id: string, dto: CreateAddressDto) {
    const addr = await this.findOwned(userId, id);
    if (dto.isDefault) {
      await this.addresses.update({ userId }, { isDefault: false });
    }
    addr.receiver = dto.receiver;
    addr.phone = dto.phone;
    addr.province = dto.province;
    addr.city = dto.city;
    addr.district = dto.district;
    addr.detail = dto.detail;
    if (dto.isDefault !== undefined) addr.isDefault = dto.isDefault;
    const saved = await this.addresses.save(addr);
    return this.toVo(saved);
  }

  async remove(userId: string, id: string) {
    const addr = await this.findOwned(userId, id);
    if (addr.isDefault) {
      throw new BadRequestException('不能删除默认地址');
    }
    await this.addresses.remove(addr);
    return { ok: true };
  }

  async setDefault(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.addresses.update({ userId }, { isDefault: false });
    await this.addresses.update({ userId, id }, { isDefault: true });
    const updated = await this.findOwned(userId, id);
    return this.toVo(updated);
  }

  async getDefault(userId: string) {
    const addr = await this.addresses.findOne({ where: { userId, isDefault: true } });
    if (addr) return this.toVo(addr);
    const first = await this.addresses.findOne({ where: { userId }, order: { id: 'ASC' } });
    if (!first) throw new NotFoundException('暂无收货地址');
    return this.toVo(first);
  }

  private async findOwned(userId: string, id: string) {
    const addr = await this.addresses.findOne({ where: { userId, id } });
    if (!addr) throw new NotFoundException('地址不存在');
    return addr;
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
