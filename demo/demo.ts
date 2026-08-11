/**
 * Demo: vòng đời một ca sửa xe trong mạng lưới.
 *
 *   npm run demo
 *
 * Không kết nối gì, không gọi API. Toàn bộ là dữ liệu bịa đi qua nhân nghiệp vụ.
 */

import {
  garageDuDieuKien, tyLeTai, danhDauHetHan, tinhTrangVong, chonGarage, xepHangBaoGia,
  trongSoTheoUuTien,
  kiemTraBanGiao, kiemTraChuoi, aiDangGiu, chenhLechGiuaCacLan, canhBaoTuChuoi,
  tinhQuyetToan, ngayTraPhanGiuLai, tinhTrangThanhToan, traTien, doiChieuVoiBaoGia,
  type LanThanhToan,
} from '../src/index.js';
import {
  BAO_GIA, CHUOI_BAN_GIAO, GIA_DA_BAO_KHACH, HANG_MUC, MANG_LUOI, NOW,
  QUYET_TOAN, YEU_CAU,
} from './seed.js';

const h = (t: string) => console.log(`\n\x1b[1m\x1b[36m── ${t}\x1b[0m`);
const dim = (t: string) => `\x1b[2m${t}\x1b[0m`;
const ok = (t: string) => `\x1b[32m${t}\x1b[0m`;
const no = (t: string) => `\x1b[31m${t}\x1b[0m`;
const vang = (t: string) => `\x1b[33m${t}\x1b[0m`;
const vnd = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}đ`;

// ─────────────────────────────────────────────────────────────
h('1. Yêu cầu của khách');
console.log(`${YEU_CAU.ma} · ${YEU_CAU.khachHang} · ${YEU_CAU.hangXe} ${YEU_CAU.dongXe} · ${YEU_CAU.bienSo}`);
console.log(dim(`"${YEU_CAU.moTaVanDe}" — hạng mục: ${HANG_MUC}, mức ưu tiên: ${YEU_CAU.uuTien}`));

// ─────────────────────────────────────────────────────────────
h('2. Lọc garage đủ điều kiện');
console.log('garage                 khoảng cách  chất lượng  tải      chuyên môn');
for (const g of MANG_LUOI) {
  const du = garageDuDieuKien([g], HANG_MUC).length > 0;
  const ly = !g.dangHoatDong ? 'ngừng hoạt động' : tyLeTai(g) >= 1 ? 'kín chỗ' : !g.chuyenMon.includes(HANG_MUC) ? 'không làm hạng mục này' : '';
  console.log(
    `${(du ? ok('✓') : no('✗'))} ${g.ten.padEnd(21)} ${String(g.khoangCachKm + ' km').padStart(8)}  ${String(g.diemChatLuong).padStart(9)}  ${String(Math.round(tyLeTai(g) * 100) + '%').padStart(4)}   ${ly ? no(ly) : dim(g.chuyenMon.join(', '))}`
  );
}
console.log(dim('\nChuyên môn là ràng buộc cứng: gửi xe hộp số tới garage chỉ làm đồng sơn thì họ'));
console.log(dim('sẽ nhận rồi thuê ngoài, và chất lượng ra khỏi tầm kiểm soát của mạng lưới.'));

// ─────────────────────────────────────────────────────────────
h('3. Vòng báo giá');
const baoGia = danhDauHetHan(BAO_GIA, NOW);
const tt = tinhTrangVong(baoGia);
console.log(`Gửi ${tt.daGui} yêu cầu · ${tt.daBao} đã báo giá · ${tt.tuChoi} từ chối · ${tt.hetHan} hết hạn`);
console.log(`Đủ cơ sở để quyết định: ${tt.duDeQuyetDinh ? ok('có') : no('chưa')}`);
console.log(dim('\nMột báo giá đơn độc thì không so được với gì, và người điều phối không có cơ sở'));
console.log(dim('nào để bảo vệ lựa chọn đó trước khách hoặc trước kế toán.'));

const xepHang = xepHangBaoGia(baoGia, MANG_LUOI, trongSoTheoUuTien(YEU_CAU.uuTien));
console.log('\ngarage                     giá      giờ   điểm   giá  c.lượng  t.gian  k.cách');
for (const x of xepHang) {
  const b = baoGia.find((y) => y.id === x.baoGiaId)!;
  console.log(
    `${x.tenGarage.padEnd(22)} ${vnd(x.giaTruocThue).padStart(11)} ${String(b.soGioUocTinh).padStart(5)}  ${String(x.diem).padStart(5)}  ${String(x.thanhPhan.gia).padStart(4)}  ${String(x.thanhPhan.chatLuong).padStart(7)}  ${String(x.thanhPhan.thoiGian).padStart(6)}  ${String(x.thanhPhan.khoangCach).padStart(6)}`
  );
}

const kq = chonGarage(baoGia, MANG_LUOI, YEU_CAU.uuTien);
console.log(`\n→ Chọn ${ok(kq.chon!.tenGarage)}`);
console.log(`  ${dim(kq.giaiThich ?? '')}`);

const khan = chonGarage(baoGia, MANG_LUOI, 'khan');
console.log(`\nNếu khách đánh dấu KHẨN: chọn ${vang(khan.chon!.tenGarage)}`);
console.log(dim('  Xe hỏng giữa đường thì khách cần xe chạy được, không cần rẻ hơn 300 nghìn.'));
console.log(dim('  Dùng cùng bộ trọng số cho mọi mức ưu tiên là bỏ qua chính lý do đánh dấu khẩn.'));

// ─────────────────────────────────────────────────────────────
h('4. Chuỗi bàn giao xe');
console.log('lần  từ            đến           km        xăng  ảnh  ký');
for (const b of CHUOI_BAN_GIAO) {
  const kt = kiemTraBanGiao(b);
  console.log(
    `${b.id.slice(-1)}    ${b.tu.padEnd(13)} ${b.den.padEnd(13)} ${String(b.soKm).padStart(7)} ${String(b.nhienLieu + '%').padStart(5)} ${String(b.soAnh).padStart(4)}  ${kt.hopLe ? ok('đủ') : no(kt.loi[0])}`
  );
}

const loHong = kiemTraChuoi(CHUOI_BAN_GIAO, true);
console.log(`\nChuỗi liền mạch: ${loHong.length === 0 ? ok('có') : no(loHong.map((l) => l.moTa).join('; '))}`);
console.log(`Xe hiện đang ở: ${ok(aiDangGiu(CHUOI_BAN_GIAO))}`);

console.log('\nChênh lệch giữa các lần bàn giao:');
console.log('bên giữ xe      km chạy thêm  xăng thay đổi  hư hỏng mới');
for (const c of chenhLechGiuaCacLan(CHUOI_BAN_GIAO)) {
  console.log(
    `${c.benChiuTrachNhiem.padEnd(15)} ${String(c.kmTang).padStart(12)} ${String(c.nhienLieuThayDoi + '%').padStart(14)}  ${c.huHongMoi.length ? no(c.huHongMoi.join(', ')) : dim('—')}`
  );
}

const canhBao = canhBaoTuChuoi(CHUOI_BAN_GIAO);
if (canhBao.length) {
  console.log('\nCảnh báo:');
  for (const c of canhBao) {
    console.log(`  ${c.muc === 'nghiem_trong' ? no('■') : vang('▲')} ${c.noiDung}`);
  }
}
console.log(dim('\nMọi thay đổi trên xe quy được về đúng một bên — bên đã GIỮ xe trong khoảng đó.'));
console.log(dim('Không có chuỗi thì tranh chấp giải quyết bằng lời nói, và khách thường chịu thiệt.'));

// ─────────────────────────────────────────────────────────────
h('5. Quyết toán với garage');
const t = tinhQuyetToan(QUYET_TOAN);

console.log('hạng mục                                sl      đơn giá     thành tiền  thuế');
for (const d of QUYET_TOAN.cacDong) {
  console.log(
    `${d.moTa.slice(0, 38).padEnd(39)} ${String(d.soLuong).padStart(3)} ${vnd(d.donGia).padStart(12)} ${vnd(d.soLuong * d.donGia).padStart(14)}  ${d.chiuThue ? 'có' : dim('không')}`
  );
}

console.log(`\nKhông chịu thuế (công thợ)      ${vnd(t.khongChiuThue).padStart(14)}`);
console.log(`Chịu thuế (phụ tùng)            ${vnd(t.chiuThue).padStart(14)}`);
console.log(`Thuế VAT 10% trên phần chịu thuế ${vnd(t.thue).padStart(13)}`);
console.log(`${ok('TỔNG CỘNG')}                       ${ok(vnd(t.tongCong).padStart(14))}`);
console.log(`Giữ lại 10% tới hết bảo hành    ${no(vnd(t.giuLai).padStart(14))}`);
console.log(`Trả ngay sau nghiệm thu         ${vnd(t.traNgay).padStart(14)}`);

const neuTinhSai = Math.round((t.khongChiuThue + t.chiuThue) * QUYET_TOAN.thueSuat);
console.log(dim(`\nNếu tính thuế trên tổng: ${vnd(neuTinhSai)} — mạng lưới trả thừa ${vnd(neuTinhSai - t.thue)}.`));
console.log(dim('Công thợ ở nhiều garage nhỏ không có hoá đơn, không chịu VAT.'));

console.log(`\nPhần giữ lại trả sau ngày: ${ngayTraPhanGiuLai(QUYET_TOAN)}`);
console.log(dim('Tính từ ngày HOÀN THÀNH CÔNG VIỆC, không phải ngày lập phiếu — bảo hành bắt đầu'));
console.log(dim('chạy khi khách nhận xe, và hai mốc đó có thể cách nhau nhiều ngày.'));

// ─────────────────────────────────────────────────────────────
h('6. Thanh toán — thử trả cả phần giữ lại');
let cacLanTra: LanThanhToan[] = [];
try {
  cacLanTra = traTien(QUYET_TOAN, cacLanTra, t.tongCong, NOW.toISOString(), NOW);
  console.log(no('LỌT: đã trả cả phần giữ lại khi bảo hành chưa hết'));
} catch (e) {
  console.log(`Trả toàn bộ ${vnd(t.tongCong)}: ${no('bị chặn')}`);
  console.log(`  ${dim((e as Error).message)}`);
}

cacLanTra = traTien(QUYET_TOAN, cacLanTra, t.traNgay, NOW.toISOString(), NOW, 'Thanh toán sau nghiệm thu');
const tt2 = tinhTrangThanhToan(QUYET_TOAN, cacLanTra, NOW);
console.log(`\nSau khi trả ${vnd(t.traNgay)}:`);
console.log(`  còn phải trả ngay ${vnd(tt2.conPhaiTraNgay)} · giữ lại ${vnd(tt2.giuLai)} · tất toán: ${tt2.tatToan ? 'có' : 'chưa'}`);

const sauBaoHanh = new Date(NOW.getTime() + 400 * 86_400_000);
const tt3 = tinhTrangThanhToan(QUYET_TOAN, cacLanTra, sauBaoHanh);
console.log(`\nSau khi hết bảo hành:`);
console.log(`  phần giữ lại đến hạn: ${ok('có')} · còn phải trả ${vnd(tt3.conPhaiTraNgay)}`);
console.log(dim('\nPhần giữ lại KHÔNG tính vào "còn phải trả ngay" — nó là khoản có điều kiện, trộn'));
console.log(dim('vào số nợ hiện tại sẽ làm cả kế toán lẫn garage hiểu nhầm là mạng lưới chậm trả.'));

// ─────────────────────────────────────────────────────────────
h('7. Đối chiếu với giá đã báo khách');
const dc = doiChieuVoiBaoGia(QUYET_TOAN, GIA_DA_BAO_KHACH);
console.log(`Báo trước ${vnd(dc.giaBaoTruoc)} → quyết toán ${vnd(dc.giaQuyetToan)}`);
console.log(`Chênh lệch ${vnd(dc.chenhLech)} (${dc.tyLeVuot}%) → ${dc.canDuyetLai ? no('cần duyệt lại') : ok('trong ngưỡng, thông qua')}`);
console.log(dim('\nPhát sinh trong lúc sửa là bình thường — mở máy ra mới thấy hết. Nhưng phát sinh'));
console.log(dim('phải được duyệt TRƯỚC khi làm, chứ không xuất hiện lần đầu trên phiếu quyết toán.'));

console.log('\n\x1b[2mMọi tên garage, khách hàng, biển số và giá trong demo là bịa.\x1b[0m\n');
