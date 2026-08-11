import { describe, it, expect } from 'vitest';
import {
  kiemTraBanGiao, kiemTraChuoi, aiDangGiu, chenhLechGiuaCacLan, canhBaoTuChuoi,
  SO_ANH_TOI_THIEU, KM_CHAY_THU_HOP_LY,
} from '../src/handover.js';
import type { BanGiao, BenGiuXe } from '../src/types.js';

const GOC = Date.parse('2026-03-01T09:00:00.000Z');
let n = 0;

/** Mỗi lần gọi sinh một mốc thời gian sau mốc trước một giờ, để thứ tự chuỗi ổn định. */
const bg = (tu: BenGiuXe, den: BenGiuXe, over: Partial<BanGiao> = {}): BanGiao => {
  n++;
  return {
    id: `BG${n}`, yeuCauId: 'YC1', tu, den,
    soKm: 50_000, nhienLieu: 60, ghiNhanHuHong: [], soAnh: 6,
    benGiaoKy: true, benNhanKy: true,
    luc: new Date(GOC + n * 3_600_000).toISOString(),
    ...over,
  };
};

describe('kiemTraBanGiao — cần cả hai bên ký', () => {
  it('bàn giao đủ điều kiện thì hợp lệ', () => {
    expect(kiemTraBanGiao(bg('khach_hang', 'dieu_phoi')).hopLe).toBe(true);
  });

  it('một bên chưa ký thì không hợp lệ', () => {
    // Chỉ một bên ký thì biên bản là lời khai một phía, vô giá trị đúng lúc cần.
    expect(kiemTraBanGiao(bg('khach_hang', 'dieu_phoi', { benNhanKy: false })).hopLe).toBe(false);
    expect(kiemTraBanGiao(bg('khach_hang', 'dieu_phoi', { benGiaoKy: false })).hopLe).toBe(false);
  });

  it('thiếu ảnh thì không hợp lệ', () => {
    const r = kiemTraBanGiao(bg('khach_hang', 'dieu_phoi', { soAnh: SO_ANH_TOI_THIEU - 1 }));
    expect(r.hopLe).toBe(false);
    expect(r.loi.some((l) => l.includes('ảnh'))).toBe(true);
  });

  it('bên giao và bên nhận trùng nhau thì vô nghĩa', () => {
    expect(kiemTraBanGiao(bg('garage', 'garage')).hopLe).toBe(false);
  });

  it('mức nhiên liệu ngoài 0–100 bị chặn', () => {
    expect(kiemTraBanGiao(bg('khach_hang', 'dieu_phoi', { nhienLieu: 120 })).hopLe).toBe(false);
  });
});

describe('kiemTraChuoi — chuỗi phải liền mạch', () => {
  it('chuỗi đầy đủ không có lỗ hổng', () => {
    const chuoi = [
      bg('khach_hang', 'dieu_phoi'),
      bg('dieu_phoi', 'garage'),
      bg('garage', 'dieu_phoi'),
      bg('dieu_phoi', 'khach_hang'),
    ];
    expect(kiemTraChuoi(chuoi, true)).toEqual([]);
  });

  it('phát hiện đứt đoạn — có lần chuyển tay không được ghi', () => {
    const chuoi = [
      bg('khach_hang', 'dieu_phoi'),
      bg('garage', 'dieu_phoi'), // lẽ ra phải giao đi từ dieu_phoi
    ];
    const r = kiemTraChuoi(chuoi);
    expect(r.some((x) => x.moTa.includes('Đứt đoạn'))).toBe(true);
  });

  it('chuỗi phải bắt đầu từ khách hàng', () => {
    const r = kiemTraChuoi([bg('dieu_phoi', 'garage')]);
    expect(r[0].moTa).toContain('bắt đầu từ');
  });

  it('công việc xong mà xe chưa về khách là lỗ hổng', () => {
    const chuoi = [bg('khach_hang', 'dieu_phoi'), bg('dieu_phoi', 'garage')];
    expect(kiemTraChuoi(chuoi, true).some((x) => x.moTa.includes('xe đang ở'))).toBe(true);
    expect(kiemTraChuoi(chuoi, false).some((x) => x.moTa.includes('xe đang ở'))).toBe(false);
  });

  it('số km không được lùi', () => {
    const chuoi = [
      bg('khach_hang', 'dieu_phoi', { soKm: 50_000 }),
      bg('dieu_phoi', 'garage', { soKm: 49_000 }),
    ];
    expect(kiemTraChuoi(chuoi).some((x) => x.moTa.includes('lùi'))).toBe(true);
  });

  it('chuỗi rỗng không báo lỗi', () => {
    expect(kiemTraChuoi([])).toEqual([]);
  });
});

describe('aiDangGiu', () => {
  it('chưa bàn giao lần nào thì xe ở chỗ khách', () => {
    expect(aiDangGiu([])).toBe('khach_hang');
  });

  it('lấy bên nhận của lần bàn giao gần nhất', () => {
    expect(aiDangGiu([bg('khach_hang', 'dieu_phoi'), bg('dieu_phoi', 'garage')])).toBe('garage');
  });
});

describe('chenhLechGiuaCacLan — quy trách nhiệm về đúng bên', () => {
  it('bên chịu trách nhiệm là bên đã GIỮ xe trong khoảng đó', () => {
    const chuoi = [
      bg('khach_hang', 'dieu_phoi', { soKm: 50_000 }),
      bg('dieu_phoi', 'garage', { soKm: 50_010 }),
    ];
    const r = chenhLechGiuaCacLan(chuoi);
    // Xe chạy 10km trong lúc điều phối giữ, nên điều phối chịu trách nhiệm.
    expect(r[0].benChiuTrachNhiem).toBe('dieu_phoi');
    expect(r[0].kmTang).toBe(10);
  });

  it('chỉ tính hư hỏng MỚI xuất hiện', () => {
    const chuoi = [
      bg('khach_hang', 'dieu_phoi', { ghiNhanHuHong: ['xước cản trước'] }),
      bg('dieu_phoi', 'garage', { ghiNhanHuHong: ['xước cản trước', 'móp cửa sau'] }),
    ];
    expect(chenhLechGiuaCacLan(chuoi)[0].huHongMoi).toEqual(['móp cửa sau']);
  });

  it('một lần bàn giao thì không có chênh lệch nào để so', () => {
    expect(chenhLechGiuaCacLan([bg('khach_hang', 'dieu_phoi')])).toEqual([]);
  });
});

describe('canhBaoTuChuoi', () => {
  it('hư hỏng mới là cảnh báo nghiêm trọng', () => {
    const chuoi = [
      bg('khach_hang', 'garage', { ghiNhanHuHong: [] }),
      bg('garage', 'khach_hang', { ghiNhanHuHong: ['nứt kính'] }),
    ];
    const r = canhBaoTuChuoi(chuoi);
    expect(r[0].muc).toBe('nghiem_trong');
    expect(r[0].benLienQuan).toBe('garage');
  });

  it('chạy thử trong mức hợp lý thì không cảnh báo', () => {
    const chuoi = [
      bg('khach_hang', 'garage', { soKm: 50_000 }),
      bg('garage', 'khach_hang', { soKm: 50_000 + KM_CHAY_THU_HOP_LY }),
    ];
    expect(canhBaoTuChuoi(chuoi)).toHaveLength(0);
  });

  it('xe chạy quá nhiều khi ở garage thì cảnh báo', () => {
    const chuoi = [
      bg('khach_hang', 'garage', { soKm: 50_000 }),
      bg('garage', 'khach_hang', { soKm: 50_200 }),
    ];
    const r = canhBaoTuChuoi(chuoi);
    expect(r.some((x) => x.noiDung.includes('200 km'))).toBe(true);
  });

  it('nhiên liệu tụt mạnh thì cảnh báo', () => {
    const chuoi = [
      bg('khach_hang', 'garage', { nhienLieu: 80 }),
      bg('garage', 'khach_hang', { nhienLieu: 40 }),
    ];
    expect(canhBaoTuChuoi(chuoi).some((x) => x.noiDung.includes('Nhiên liệu'))).toBe(true);
  });

  it('chuỗi sạch thì không cảnh báo gì', () => {
    const chuoi = [
      bg('khach_hang', 'dieu_phoi', { soKm: 50_000, nhienLieu: 60 }),
      bg('dieu_phoi', 'khach_hang', { soKm: 50_005, nhienLieu: 58 }),
    ];
    expect(canhBaoTuChuoi(chuoi)).toHaveLength(0);
  });
});
