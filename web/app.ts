/**
 * Demo web — nối giao diện với ĐÚNG các module trong `src/`.
 * Không có bản sao logic nào ở đây.
 */

import {
  garageDuDieuKien, tyLeTai, danhDauHetHan, tinhTrangVong, chonGarage,
  trongSoTheoUuTien,
  kiemTraBanGiao, kiemTraChuoi, aiDangGiu, chenhLechGiuaCacLan, canhBaoTuChuoi,
  tinhQuyetToan, ngayTraPhanGiuLai, tinhTrangThanhToan, traTien, doiChieuVoiBaoGia,
  type LanThanhToan, type MucUuTien, type QuyetToan,
} from '../src/index.js';
import {
  BAO_GIA, CHUOI_BAN_GIAO, GIA_DA_BAO_KHACH, HANG_MUC, MANG_LUOI, NOW, QUYET_TOAN,
} from '../demo/seed.js';

const REPO = 'https://github.com/dat8103/gara-network';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[];
const esc = (s: unknown) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const vnd = (n: number) => `${Math.round(n).toLocaleString('vi-VN')}đ`;

for (const a of ['#repo-link', '#foot-repo']) $<HTMLAnchorElement>(a).href = REPO;

for (const btn of $$('nav.tabs button')) {
  btn.addEventListener('click', () => {
    $$('nav.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    $$('section.panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${btn.dataset.tab}`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ═══ TAB 1 — BÁO GIÁ ══════════════════════════════════════════════════════

const duDieuKien = new Set(garageDuDieuKien(MANG_LUOI, HANG_MUC).map((g) => g.id));

$('#garage-tbl').innerHTML =
  `<thead><tr><th>Garage</th><th class="num">Cách</th><th class="num">Chất lượng</th><th class="num">Tải</th><th>Kết quả lọc</th></tr></thead><tbody>` +
  MANG_LUOI.map((g) => {
    const du = duDieuKien.has(g.id);
    const ly = !g.dangHoatDong ? 'ngừng hoạt động'
      : tyLeTai(g) >= 1 ? 'kín chỗ'
      : !g.chuyenMon.includes(HANG_MUC) ? 'không làm hạng mục này' : '';
    return `<tr style="${du ? '' : 'opacity:.5'}">
      <td>${esc(g.ten)}<div class="hint" style="margin:2px 0 0">${esc(g.chuyenMon.join(', '))}</div></td>
      <td class="num">${g.khoangCachKm} km</td>
      <td class="num">${g.diemChatLuong}</td>
      <td class="num">${Math.round(tyLeTai(g) * 100)}%</td>
      <td>${du ? '<span class="pill ok">đủ điều kiện</span>' : `<span class="pill danger">${esc(ly)}</span>`}</td></tr>`;
  }).join('') +
  '</tbody>';

const baoGia = danhDauHetHan(BAO_GIA, NOW);

function renderQuote() {
  const uuTien = $<HTMLSelectElement>('#uu-tien').value as MucUuTien;
  const ts = trongSoTheoUuTien(uuTien);

  $('#weights-out').innerHTML =
    `<p class="hint" style="margin:0 0 6px">Trọng số đang dùng:</p>` +
    (['gia', 'chatLuong', 'thoiGian', 'khoangCach'] as const)
      .map((k) => {
        const nhan = { gia: 'Giá', chatLuong: 'Chất lượng', thoiGian: 'Thời gian', khoangCach: 'Khoảng cách' }[k];
        return `<div style="margin-bottom:8px">
          <div class="row" style="border:0;padding:0 0 4px"><span class="k">${nhan}</span><span class="v">${Math.round(ts[k] * 100)}%</span></div>
          <div class="bar"><i style="width:${ts[k] * 100 * 2}%"></i></div></div>`;
      })
      .join('');

  const kq = chonGarage(baoGia, MANG_LUOI, uuTien);

  $('#rank-tbl').innerHTML =
    `<thead><tr><th>Garage</th><th class="num">Giá</th><th class="num">Giờ</th><th class="num">Điểm</th><th></th></tr></thead><tbody>` +
    kq.xepHang.map((x, i) => {
      const b = baoGia.find((y) => y.id === x.baoGiaId)!;
      return `<tr style="${i === 0 ? 'font-weight:600' : ''}">
        <td>${esc(x.tenGarage)}
          <div class="hint" style="margin:2px 0 0">giá ${x.thanhPhan.gia} · c.lượng ${x.thanhPhan.chatLuong} · t.gian ${x.thanhPhan.thoiGian} · k.cách ${x.thanhPhan.khoangCach}</div></td>
        <td class="num">${vnd(x.giaTruocThue)}${x.datHonReNhat > 0 ? `<div class="hint" style="margin:2px 0 0">+${x.datHonReNhat}%</div>` : ''}</td>
        <td class="num">${b.soGioUocTinh}</td>
        <td class="num">${x.diem}</td>
        <td>${i === 0 ? '<span class="pill ok">chọn</span>' : ''}</td></tr>`;
    }).join('') +
    '</tbody>';

  $('#pick-note').innerHTML = kq.chon
    ? `<strong>${esc(kq.chon.tenGarage)}</strong>${esc(kq.giaiThich ?? '')}`
    : '<strong>Chưa chọn được</strong>Không có báo giá hợp lệ nào.';
}
$('#uu-tien').addEventListener('change', renderQuote);

{
  const tt = tinhTrangVong(baoGia);
  $('#round-out').innerHTML = `
    <div class="row"><span class="k">Đã gửi yêu cầu</span><span class="v">${tt.daGui}</span></div>
    <div class="row"><span class="k">Đã báo giá</span><span class="v">${tt.daBao}</span></div>
    <div class="row"><span class="k">Từ chối</span><span class="v">${tt.tuChoi}</span></div>
    <div class="row"><span class="k">Hết hạn không phản hồi</span><span class="v">${tt.hetHan}</span></div>
    <div class="row total"><span class="k">Đủ cơ sở quyết định</span>
      <span class="v"><span class="pill ${tt.duDeQuyetDinh ? 'ok' : 'danger'}">${tt.duDeQuyetDinh ? 'có' : 'chưa'}</span></span></div>`;
}

// ═══ TAB 2 — BÀN GIAO ═════════════════════════════════════════════════════

function bangChuoi(chuoi: typeof CHUOI_BAN_GIAO): string {
  return `<thead><tr><th>Từ → đến</th><th class="num">Km</th><th class="num">Xăng</th><th class="num">Ảnh</th><th>Hợp lệ</th></tr></thead><tbody>` +
    chuoi.map((b) => {
      const kt = kiemTraBanGiao(b);
      return `<tr>
        <td>${esc(b.tu)} → ${esc(b.den)}
          ${b.ghiNhanHuHong.length ? `<div class="hint" style="margin:2px 0 0">${esc(b.ghiNhanHuHong.join(', '))}</div>` : ''}</td>
        <td class="num">${b.soKm.toLocaleString('vi-VN')}</td>
        <td class="num">${b.nhienLieu}%</td>
        <td class="num">${b.soAnh}</td>
        <td>${kt.hopLe ? '<span class="pill ok">đủ</span>' : `<span class="pill danger">${esc(kt.loi[0])}</span>`}</td></tr>`;
    }).join('') + '</tbody>';
}

$('#chain-tbl').innerHTML = bangChuoi(CHUOI_BAN_GIAO);

{
  const loHong = kiemTraChuoi(CHUOI_BAN_GIAO, true);
  $('#chain-status').innerHTML = `
    <div class="row"><span class="k">Chuỗi liền mạch</span>
      <span class="v"><span class="pill ${loHong.length ? 'danger' : 'ok'}">${loHong.length ? `${loHong.length} lỗ hổng` : 'có'}</span></span></div>
    <div class="row"><span class="k">Xe hiện đang ở</span><span class="v">${esc(aiDangGiu(CHUOI_BAN_GIAO))}</span></div>`;

  $('#diff-tbl').innerHTML =
    `<thead><tr><th>Bên giữ xe</th><th class="num">Km chạy thêm</th><th class="num">Xăng đổi</th><th>Hư hỏng mới</th></tr></thead><tbody>` +
    chenhLechGiuaCacLan(CHUOI_BAN_GIAO).map((c) => `<tr>
      <td>${esc(c.benChiuTrachNhiem)}</td>
      <td class="num">${c.kmTang}</td>
      <td class="num">${c.nhienLieuThayDoi}%</td>
      <td>${c.huHongMoi.length ? `<span class="pill danger">${esc(c.huHongMoi.join(', '))}</span>` : '—'}</td></tr>`).join('') +
    '</tbody>';
}

function renderWarn() {
  const km = Number($<HTMLInputElement>('#km').value);
  $('#km-label').textContent = String(km);
  const cb = canhBaoTuChuoi(CHUOI_BAN_GIAO, km);
  $('#warn-out').innerHTML = cb.length
    ? cb.map((c) => `<div class="note" style="border-left-color:var(--${c.muc === 'nghiem_trong' ? 'danger' : 'warn'});background:transparent;margin:0 0 10px">
        <strong>${c.muc === 'nghiem_trong' ? 'Nghiêm trọng' : 'Cảnh báo'} — ${esc(c.benLienQuan)}</strong>${esc(c.noiDung)}</div>`).join('')
    : '<p class="hint" style="margin:0">Không có cảnh báo nào ở ngưỡng này.</p>';
}
$('#km').addEventListener('input', renderWarn);

$('#drop').innerHTML =
  `<option value="-1">Không bỏ lần nào</option>` +
  CHUOI_BAN_GIAO.map((b, i) => `<option value="${i}">Bỏ lần ${i + 1}: ${esc(b.tu)} → ${esc(b.den)}</option>`).join('');

function renderGap() {
  const i = Number($<HTMLSelectElement>('#drop').value);
  const chuoi = i < 0 ? CHUOI_BAN_GIAO : CHUOI_BAN_GIAO.filter((_, k) => k !== i);
  const loHong = kiemTraChuoi(chuoi, true);

  $('#gap-out').innerHTML =
    `<div class="row"><span class="k">Kết quả kiểm tra</span>
      <span class="v"><span class="pill ${loHong.length ? 'danger' : 'ok'}">${loHong.length ? `${loHong.length} lỗ hổng` : 'liền mạch'}</span></span></div>` +
    loHong.map((l) => `<p class="hint" style="margin:8px 0 0">${esc(l.moTa)}</p>`).join('') +
    (loHong.length ? '<p class="hint" style="margin:10px 0 0">Đó chính là khoảng thời gian không ai chịu trách nhiệm nếu xe hỏng.</p>' : '');
}
$('#drop').addEventListener('change', renderGap);

// ═══ TAB 3 — QUYẾT TOÁN ═══════════════════════════════════════════════════

$('#lines-tbl').innerHTML =
  `<thead><tr><th>Hạng mục</th><th class="num">SL</th><th class="num">Thành tiền</th><th>Thuế</th></tr></thead><tbody>` +
  QUYET_TOAN.cacDong.map((d) => `<tr>
    <td style="font-size:12px">${esc(d.moTa)}</td>
    <td class="num">${d.soLuong}</td>
    <td class="num">${vnd(d.soLuong * d.donGia)}</td>
    <td>${d.chiuThue ? '<span class="pill warn">chịu VAT</span>' : '<span class="pill">không</span>'}</td></tr>`).join('') +
  '</tbody>';

function phieuHienTai(): QuyetToan {
  return {
    ...QUYET_TOAN,
    tyLeGiuLai: Number($<HTMLInputElement>('#hold').value) / 100,
    baoHanhThang: Number($<HTMLInputElement>('#warr').value),
  };
}

function renderSettle() {
  const qt = phieuHienTai();
  const t = tinhQuyetToan(qt);

  $('#hold-label').textContent = `${Math.round(qt.tyLeGiuLai * 100)}%`;
  $('#warr-label').textContent = String(qt.baoHanhThang);

  $('#calc-out').innerHTML = `
    <div class="row"><span class="k">Không chịu thuế (công thợ)</span><span class="v">${vnd(t.khongChiuThue)}</span></div>
    <div class="row"><span class="k">Chịu thuế (phụ tùng)</span><span class="v">${vnd(t.chiuThue)}</span></div>
    <div class="row"><span class="k">VAT 10% trên phần chịu thuế</span><span class="v">${vnd(t.thue)}</span></div>
    <div class="row total"><span class="k">Tổng cộng</span><span class="v">${vnd(t.tongCong)}</span></div>`;

  const neuSai = Math.round((t.khongChiuThue + t.chiuThue) * QUYET_TOAN.thueSuat);
  $('#tax-note').innerHTML = `<strong>Nếu tính thuế trên tổng: ${vnd(neuSai)}</strong>
    Mạng lưới trả thừa ${vnd(neuSai - t.thue)}. Công thợ ở nhiều garage nhỏ không có hoá đơn, không chịu VAT.`;

  const ngay = ngayTraPhanGiuLai(qt);
  $('#hold-out').innerHTML = `
    <div class="row"><span class="k">Giữ lại</span><span class="v">${vnd(t.giuLai)}</span></div>
    <div class="row"><span class="k">Trả ngay sau nghiệm thu</span><span class="v">${vnd(t.traNgay)}</span></div>
    <div class="row"><span class="k">Phần giữ lại trả sau ngày</span><span class="v">${ngay ?? '—'}</span></div>
    <p class="hint" style="margin:10px 0 0">Tính từ ngày <b>hoàn thành công việc</b>, không phải ngày lập phiếu — bảo hành bắt đầu chạy khi khách nhận xe.</p>`;

  const dc = doiChieuVoiBaoGia(qt, GIA_DA_BAO_KHACH);
  $('#compare-out').innerHTML = `
    <div class="row"><span class="k">Giá đã báo khách</span><span class="v">${vnd(dc.giaBaoTruoc)}</span></div>
    <div class="row"><span class="k">Quyết toán thực tế</span><span class="v">${vnd(dc.giaQuyetToan)}</span></div>
    <div class="row"><span class="k">Chênh lệch</span><span class="v">${vnd(dc.chenhLech)} (${dc.tyLeVuot}%)</span></div>
    <div class="row total"><span class="k">Kết luận</span>
      <span class="v"><span class="pill ${dc.canDuyetLai ? 'danger' : 'ok'}">${dc.canDuyetLai ? 'cần duyệt lại' : 'trong ngưỡng'}</span></span></div>`;

  renderPay();
}
for (const id of ['#hold', '#warr']) $(id).addEventListener('input', renderSettle);

function renderPay() {
  const qt = phieuHienTai();
  const t = tinhQuyetToan(qt);
  const pct = Number($<HTMLInputElement>('#pay').value) / 100;
  const soTien = Math.round(t.tongCong * pct);
  const sauBaoHanh = $<HTMLInputElement>('#after-warr').checked;
  const luc = sauBaoHanh ? new Date(NOW.getTime() + 800 * 86_400_000) : NOW;

  $('#pay-label').textContent = vnd(soTien);

  const cacLanTra: LanThanhToan[] = [];
  let ketQua = '';
  try {
    if (soTien <= 0) throw new Error('Chọn một số tiền lớn hơn 0.');
    traTien(qt, cacLanTra, soTien, 'now', luc);
    ketQua = `<div class="row"><span class="k">Kết quả</span><span class="v"><span class="pill ok">chấp nhận</span></span></div>`;
  } catch (e) {
    ketQua = `<div class="row"><span class="k">Kết quả</span><span class="v"><span class="pill danger">bị chặn</span></span></div>
      <p class="hint" style="margin:10px 0 0">${esc((e as Error).message)}</p>`;
  }

  const tt = tinhTrangThanhToan(qt, cacLanTra, luc);
  $('#pay-out').innerHTML =
    `<div class="row"><span class="k">Được trả tối đa lúc này</span><span class="v">${vnd(tt.conPhaiTraNgay)}</span></div>
     <div class="row"><span class="k">Phần giữ lại đến hạn</span><span class="v">${tt.giuLaiDenHan ? 'có' : 'chưa'}</span></div>` +
    ketQua;
}
$('#pay').addEventListener('input', renderPay);
$('#after-warr').addEventListener('change', renderPay);

renderQuote();
renderWarn();
renderGap();
renderSettle();
