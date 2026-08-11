import { describe, it, expect } from 'vitest';
import {
  chuyenDuoc, tinhQuyetToan, ngayTraPhanGiuLai, daHetBaoHanh,
  tinhTrangThanhToan, traTien, doiChieuVoiBaoGia,
  SettlementError, THUE_SUAT_MAC_DINH, TY_LE_GIU_LAI_MAC_DINH, NGUONG_VUOT_BAO_GIA,
} from '../src/settlement.js';
import type { LanThanhToan, QuyetToan } from '../src/types.js';

const NOW = new Date('2026-03-10T00:00:00.000Z');

const qt = (over: Partial<QuyetToan> = {}): QuyetToan => ({
  id: 'QT1', ma: 'QT-20260310-001', yeuCauId: 'YC1', garageId: 'G1',
  cacDong: [
    { moTa: 'Công thợ thay lốc máy', soLuong: 10, donGia: 200_000, chiuThue: false },
    { moTa: 'Lốc máy chính hãng', soLuong: 1, donGia: 8_000_000, chiuThue: true },
  ],
  thueSuat: THUE_SUAT_MAC_DINH,
  tyLeGiuLai: TY_LE_GIU_LAI_MAC_DINH,
  baoHanhThang: 6,
  trangThai: 'da_duyet',
  taoLuc: '2026-03-01T00:00:00.000Z',
  hoanThanhCongViecLuc: '2026-03-01T00:00:00.000Z',
  ...over,
});

describe('tinhQuyetToan — thuế chỉ tính trên phần chịu thuế', () => {
  it('tách đúng phần chịu thuế và không chịu thuế', () => {
    const t = tinhQuyetToan(qt());
    expect(t.khongChiuThue).toBe(2_000_000); // công thợ
    expect(t.chiuThue).toBe(8_000_000);      // phụ tùng
    expect(t.thue).toBe(800_000);            // 10% của 8 triệu, KHÔNG phải của 10 triệu
    expect(t.tongCong).toBe(10_800_000);
  });

  it('tính thuế trên tổng sẽ ra số khác — và mạng lưới trả thừa', () => {
    const t = tinhQuyetToan(qt());
    const neuTinhSai = (t.khongChiuThue + t.chiuThue) * THUE_SUAT_MAC_DINH;
    expect(t.thue).toBeLessThan(neuTinhSai);
  });

  it('giữ lại tính trên tổng gồm cả thuế', () => {
    const t = tinhQuyetToan(qt());
    expect(t.giuLai).toBe(1_080_000);
    expect(t.traNgay).toBe(9_720_000);
    expect(t.giuLai + t.traNgay).toBe(t.tongCong);
  });

  it('không giữ lại thì trả hết ngay', () => {
    const t = tinhQuyetToan(qt({ tyLeGiuLai: 0 }));
    expect(t.giuLai).toBe(0);
    expect(t.traNgay).toBe(t.tongCong);
  });

  it('phiếu rỗng cho ra 0, không ném lỗi', () => {
    expect(tinhQuyetToan(qt({ cacDong: [] })).tongCong).toBe(0);
  });

  it('chặn tham số vô lý', () => {
    expect(() => tinhQuyetToan(qt({ thueSuat: 1.5 }))).toThrow(SettlementError);
    expect(() => tinhQuyetToan(qt({ tyLeGiuLai: -0.1 }))).toThrow(SettlementError);
    expect(() => tinhQuyetToan(qt({ cacDong: [{ moTa: 'x', soLuong: -1, donGia: 100, chiuThue: false }] })))
      .toThrow(/âm/);
  });
});

describe('phần giữ lại tới hết bảo hành', () => {
  it('tính hạn từ ngày HOÀN THÀNH CÔNG VIỆC, không phải ngày lập phiếu', () => {
    const r = ngayTraPhanGiuLai(qt({
      taoLuc: '2026-03-01T00:00:00.000Z',
      hoanThanhCongViecLuc: '2026-01-15T00:00:00.000Z',
      baoHanhThang: 6,
    }));
    expect(r).toBe('2026-07-15');
  });

  it('chưa hoàn thành thì chưa có hạn', () => {
    expect(ngayTraPhanGiuLai(qt({ hoanThanhCongViecLuc: undefined }))).toBeNull();
    expect(daHetBaoHanh(qt({ hoanThanhCongViecLuc: undefined }), NOW)).toBe(false);
  });

  it('trong thời gian bảo hành thì chưa tới hạn', () => {
    expect(daHetBaoHanh(qt(), NOW)).toBe(false);
  });

  it('hết bảo hành thì tới hạn', () => {
    const sau = new Date('2026-10-01T00:00:00.000Z');
    expect(daHetBaoHanh(qt(), sau)).toBe(true);
  });
});

describe('tinhTrangThanhToan', () => {
  it('phần giữ lại KHÔNG tính vào số còn phải trả ngay', () => {
    const tt = tinhTrangThanhToan(qt(), [], NOW);
    expect(tt.conPhaiTraNgay).toBe(9_720_000);
    expect(tt.giuLai).toBe(1_080_000);
    expect(tt.giuLaiDenHan).toBe(false);
  });

  it('trả xong phần trả ngay thì hết nợ hiện tại nhưng chưa tất toán', () => {
    const tt = tinhTrangThanhToan(qt(), [{ quyetToanId: 'QT1', soTien: 9_720_000, luc: 'x' }], NOW);
    expect(tt.conPhaiTraNgay).toBe(0);
    expect(tt.tatToan).toBe(false);
  });

  it('hết bảo hành thì phần giữ lại vào số phải trả', () => {
    const sau = new Date('2026-10-01T00:00:00.000Z');
    const tt = tinhTrangThanhToan(qt(), [{ quyetToanId: 'QT1', soTien: 9_720_000, luc: 'x' }], sau);
    expect(tt.giuLaiDenHan).toBe(true);
    expect(tt.conPhaiTraNgay).toBe(1_080_000);
  });

  it('chỉ tính các lần trả của đúng phiếu đó', () => {
    const tt = tinhTrangThanhToan(qt(), [{ quyetToanId: 'PHIEU_KHAC', soTien: 5_000_000, luc: 'x' }], NOW);
    expect(tt.daTra).toBe(0);
  });
});

describe('traTien', () => {
  it('ghi nhận lần trả hợp lệ', () => {
    const r = traTien(qt(), [], 5_000_000, 'now', NOW);
    expect(r).toHaveLength(1);
    expect(r[0].soTien).toBe(5_000_000);
  });

  it('KHÔNG trả được phần giữ lại khi bảo hành chưa hết', () => {
    // Trả trước phần giữ lại là làm mất chính cơ chế nó sinh ra để bảo đảm.
    expect(() => traTien(qt(), [], 10_800_000, 'now', NOW)).toThrow(/giữ lại/);
  });

  it('hết bảo hành thì trả được toàn bộ', () => {
    const sau = new Date('2026-10-01T00:00:00.000Z');
    expect(() => traTien(qt(), [], 10_800_000, 'now', sau)).not.toThrow();
  });

  it('phiếu chưa duyệt thì chưa trả tiền được', () => {
    expect(() => traTien(qt({ trangThai: 'cho_duyet' }), [], 1_000_000, 'now', NOW)).toThrow(/chưa trả tiền/);
  });

  it('số tiền không hợp lệ bị chặn', () => {
    for (const x of [0, -1, NaN]) {
      expect(() => traTien(qt(), [], x, 'now', NOW)).toThrow(SettlementError);
    }
  });

  it('cộng dồn nhiều lần trả', () => {
    let ls: LanThanhToan[] = [];
    ls = traTien(qt(), ls, 5_000_000, 'l1', NOW);
    ls = traTien(qt(), ls, 4_720_000, 'l2', NOW);
    expect(tinhTrangThanhToan(qt(), ls, NOW).conPhaiTraNgay).toBe(0);
    expect(() => traTien(qt(), ls, 1, 'l3', NOW)).toThrow();
  });
});

describe('chuyenDuoc — máy trạng thái', () => {
  it('luồng thuận chạy được', () => {
    expect(chuyenDuoc('nhap', 'cho_duyet')).toBe(true);
    expect(chuyenDuoc('cho_duyet', 'da_duyet')).toBe(true);
    expect(chuyenDuoc('da_duyet', 'dang_tra')).toBe(true);
    expect(chuyenDuoc('dang_tra', 'da_tra')).toBe(true);
  });

  it('đã trả xong thì không quay lại', () => {
    expect(chuyenDuoc('da_tra', 'dang_tra')).toBe(false);
    expect(chuyenDuoc('da_tra', 'nhap')).toBe(false);
  });

  it('bị từ chối thì sửa lại rồi trình lại được', () => {
    expect(chuyenDuoc('tu_choi', 'nhap')).toBe(true);
  });

  it('không nhảy cóc từ nháp thẳng sang đã duyệt', () => {
    expect(chuyenDuoc('nhap', 'da_duyet')).toBe(false);
  });
});

describe('doiChieuVoiBaoGia', () => {
  it('trong ngưỡng thì không cần duyệt lại', () => {
    const r = doiChieuVoiBaoGia(qt(), 10_500_000);
    expect(r.canDuyetLai).toBe(false);
    expect(r.chenhLech).toBe(300_000);
  });

  it('vượt ngưỡng thì phải duyệt lại', () => {
    const r = doiChieuVoiBaoGia(qt(), 8_000_000);
    expect(r.canDuyetLai).toBe(true);
    expect(r.tyLeVuot).toBe(35);
  });

  it('quyết toán thấp hơn báo giá thì không sao', () => {
    expect(doiChieuVoiBaoGia(qt(), 15_000_000).canDuyetLai).toBe(false);
  });

  it('không có báo giá trước thì không chia cho 0', () => {
    expect(doiChieuVoiBaoGia(qt(), 0).tyLeVuot).toBe(0);
  });

  it('ngưỡng chỉnh được', () => {
    expect(doiChieuVoiBaoGia(qt(), 10_000_000, 0.05).canDuyetLai).toBe(true);
    expect(doiChieuVoiBaoGia(qt(), 10_000_000, 0.2).canDuyetLai).toBe(false);
    expect(NGUONG_VUOT_BAO_GIA).toBe(0.1);
  });
});
