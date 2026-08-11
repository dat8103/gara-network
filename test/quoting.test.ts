import { describe, it, expect } from 'vitest';
import {
  garageDuDieuKien, tyLeTai, xepHangBaoGia, chonGarage, danhDauHetHan,
  tinhTrangVong, trongSoTheoUuTien, TRONG_SO_MAC_DINH, TRONG_SO_KHAN,
} from '../src/quoting.js';
import type { BaoGiaDoiTac, Garage } from '../src/types.js';

const NOW = new Date('2026-03-10T09:00:00.000Z');
const gio = (n: number) => new Date(NOW.getTime() + n * 3_600_000).toISOString();

const g = (over: Partial<Garage> = {}): Garage => ({
  id: 'G1', ten: 'Garage Thành Công', khoangCachKm: 5, diemChatLuong: 80,
  dangNhan: 3, sucChua: 10, chuyenMon: ['dong_co', 'dien'], dangHoatDong: true,
  ...over,
});

const bg = (over: Partial<BaoGiaDoiTac> = {}): BaoGiaDoiTac => ({
  id: 'BG1', yeuCauId: 'YC1', garageId: 'G1', trangThai: 'da_bao',
  giaTruocThue: 5_000_000, soGioUocTinh: 8, baoHanhThang: 6,
  guiLuc: gio(-24), baoLuc: gio(-20), hanPhanHoi: gio(-2),
  ...over,
});

describe('garageDuDieuKien — ba điều kiện loại thẳng', () => {
  it('loại garage ngừng hoạt động', () => {
    expect(garageDuDieuKien([g({ dangHoatDong: false })], 'dong_co')).toHaveLength(0);
  });

  it('loại garage đã kín chỗ', () => {
    expect(garageDuDieuKien([g({ dangNhan: 10, sucChua: 10 })], 'dong_co')).toHaveLength(0);
  });

  it('loại garage không làm được hạng mục', () => {
    expect(garageDuDieuKien([g({ chuyenMon: ['dong_son'] })], 'dong_co')).toHaveLength(0);
  });

  it('không lọc theo hạng mục khi để trống', () => {
    expect(garageDuDieuKien([g({ chuyenMon: ['dong_son'] })], '')).toHaveLength(1);
  });

  it('sức chứa 0 coi như kín', () => {
    expect(tyLeTai(g({ dangNhan: 0, sucChua: 0 }))).toBe(1);
  });
});

describe('xepHangBaoGia', () => {
  const garages = [
    g({ id: 'RE', ten: 'Rẻ', khoangCachKm: 30, diemChatLuong: 45 }),
    g({ id: 'TOT', ten: 'Tốt', khoangCachKm: 4, diemChatLuong: 92 }),
  ];

  it('chỉ xét báo giá đã gửi giá', () => {
    const r = xepHangBaoGia([
      bg({ id: 'A', trangThai: 'da_gui', giaTruocThue: undefined }),
      bg({ id: 'B', garageId: 'TOT' }),
    ], garages);
    expect(r.map((x) => x.baoGiaId)).toEqual(['B']);
  });

  it('rẻ nhất KHÔNG mặc nhiên thắng', () => {
    const r = xepHangBaoGia([
      bg({ id: 'RE', garageId: 'RE', giaTruocThue: 4_000_000, soGioUocTinh: 20 }),
      bg({ id: 'TOT', garageId: 'TOT', giaTruocThue: 5_000_000, soGioUocTinh: 6 }),
    ], garages);
    expect(r[0].baoGiaId).toBe('TOT');
  });

  it('tính đúng phần trăm đắt hơn báo giá rẻ nhất', () => {
    const r = xepHangBaoGia([
      bg({ id: 'RE', garageId: 'RE', giaTruocThue: 4_000_000 }),
      bg({ id: 'TOT', garageId: 'TOT', giaTruocThue: 5_000_000 }),
    ], garages);
    expect(r.find((x) => x.baoGiaId === 'TOT')!.datHonReNhat).toBe(25);
  });

  it('mọi báo giá bằng nhau thì thành phần đó không phân biệt, không chia cho 0', () => {
    const r = xepHangBaoGia([
      bg({ id: 'A', garageId: 'RE', giaTruocThue: 5_000_000 }),
      bg({ id: 'B', garageId: 'TOT', giaTruocThue: 5_000_000 }),
    ], garages);
    expect(r.every((x) => x.thanhPhan.gia === 100)).toBe(true);
  });

  it('không có báo giá hợp lệ thì trả rỗng', () => {
    expect(xepHangBaoGia([bg({ trangThai: 'tu_choi' })], garages)).toEqual([]);
  });

  it('kết quả tất định khi điểm bằng nhau', () => {
    const list = [bg({ id: 'B', garageId: 'RE' }), bg({ id: 'A', garageId: 'RE' })];
    expect(xepHangBaoGia(list, garages)[0].baoGiaId)
      .toBe(xepHangBaoGia([...list].reverse(), garages)[0].baoGiaId);
  });
});

describe('trọng số theo mức ưu tiên', () => {
  it('yêu cầu khẩn coi trọng thời gian hơn giá', () => {
    expect(TRONG_SO_KHAN.thoiGian).toBeGreaterThan(TRONG_SO_KHAN.gia);
    expect(TRONG_SO_MAC_DINH.gia).toBeGreaterThan(TRONG_SO_MAC_DINH.thoiGian);
  });

  it('mọi bộ trọng số cộng lại bằng 1', () => {
    for (const ts of [TRONG_SO_MAC_DINH, TRONG_SO_KHAN]) {
      const tong = ts.gia + ts.chatLuong + ts.thoiGian + ts.khoangCach;
      expect(Math.abs(tong - 1)).toBeLessThan(1e-9);
    }
  });

  it('chỉ mức khẩn mới đảo trọng số', () => {
    expect(trongSoTheoUuTien('cao')).toEqual(TRONG_SO_MAC_DINH);
    expect(trongSoTheoUuTien('khan')).toEqual(TRONG_SO_KHAN);
  });

  it('cùng bộ báo giá nhưng mức khẩn có thể đổi kết quả chọn', () => {
    const garages = [
      g({ id: 'RE', ten: 'Rẻ chậm', khoangCachKm: 6, diemChatLuong: 70 }),
      g({ id: 'NHANH', ten: 'Đắt nhanh', khoangCachKm: 6, diemChatLuong: 70 }),
    ];
    const list = [
      bg({ id: 'A', garageId: 'RE', giaTruocThue: 4_000_000, soGioUocTinh: 30 }),
      bg({ id: 'B', garageId: 'NHANH', giaTruocThue: 5_500_000, soGioUocTinh: 5 }),
    ];
    expect(chonGarage(list, garages, 'binh_thuong').chon!.baoGiaId).toBe('A');
    expect(chonGarage(list, garages, 'khan').chon!.baoGiaId).toBe('B');
  });
});

describe('chonGarage — luôn kèm câu giải thích', () => {
  const garages = [
    g({ id: 'RE', ten: 'Rẻ', khoangCachKm: 30, diemChatLuong: 45 }),
    g({ id: 'TOT', ten: 'Tốt', khoangCachKm: 4, diemChatLuong: 92 }),
  ];

  it('chọn không phải cái rẻ nhất thì nói rõ vì sao', () => {
    const r = chonGarage([
      bg({ id: 'RE', garageId: 'RE', giaTruocThue: 4_000_000, soGioUocTinh: 20 }),
      bg({ id: 'TOT', garageId: 'TOT', giaTruocThue: 5_000_000, soGioUocTinh: 6 }),
    ], garages);
    expect(r.chon!.tenGarage).toBe('Tốt');
    expect(r.giaiThich).toContain('đắt hơn');
    expect(r.giaiThich).toContain('%');
  });

  it('rẻ nhất mà cũng tốt nhất thì nói vậy', () => {
    const r = chonGarage([
      bg({ id: 'TOT', garageId: 'TOT', giaTruocThue: 4_000_000, soGioUocTinh: 6 }),
      bg({ id: 'RE', garageId: 'RE', giaTruocThue: 6_000_000, soGioUocTinh: 20 }),
    ], garages);
    expect(r.giaiThich).toContain('vừa rẻ nhất');
  });

  it('không có báo giá nào thì trả null, không ném lỗi', () => {
    expect(chonGarage([], garages).chon).toBeNull();
  });
});

describe('danhDauHetHan', () => {
  it('báo giá quá hạn phản hồi chuyển sang hết hạn', () => {
    const r = danhDauHetHan([bg({ trangThai: 'da_gui', hanPhanHoi: gio(-1) })], NOW);
    expect(r[0].trangThai).toBe('het_han');
  });

  it('chưa tới hạn thì giữ nguyên', () => {
    const r = danhDauHetHan([bg({ trangThai: 'da_gui', hanPhanHoi: gio(5) })], NOW);
    expect(r[0].trangThai).toBe('da_gui');
  });

  it('không đụng vào báo giá đã có kết quả', () => {
    const r = danhDauHetHan([bg({ trangThai: 'da_bao', hanPhanHoi: gio(-100) })], NOW);
    expect(r[0].trangThai).toBe('da_bao');
  });
});

describe('tinhTrangVong', () => {
  it('một báo giá đơn độc chưa đủ để quyết định', () => {
    const r = tinhTrangVong([bg({ trangThai: 'da_bao' }), bg({ id: 'X', trangThai: 'da_gui' })]);
    expect(r.duDeQuyetDinh).toBe(false);
  });

  it('hai báo giá trở lên thì đủ', () => {
    const r = tinhTrangVong([bg({ id: 'A' }), bg({ id: 'B' })]);
    expect(r.duDeQuyetDinh).toBe(true);
  });

  it('một báo giá nhưng không còn ai để chờ thì vẫn quyết được', () => {
    const r = tinhTrangVong([
      bg({ id: 'A', trangThai: 'da_bao' }),
      bg({ id: 'B', trangThai: 'tu_choi' }),
      bg({ id: 'C', trangThai: 'het_han' }),
    ]);
    expect(r.duDeQuyetDinh).toBe(true);
  });

  it('không báo giá nào thì không quyết được', () => {
    expect(tinhTrangVong([]).duDeQuyetDinh).toBe(false);
  });
});
