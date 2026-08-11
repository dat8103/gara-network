# Gara Network — nhân nghiệp vụ mạng lưới garage

Nền tảng kết nối khách sửa xe với một mạng lưới garage đối tác: khách gửi yêu cầu, hệ thống gửi báo giá tới nhiều garage đủ điều kiện, chọn một garage, theo dõi xe qua từng lần bàn giao, và quyết toán với đối tác sau khi xong việc.

Repo này công khai **nhân nghiệp vụ** (`src/`): chấm điểm và chọn báo giá, chuỗi bàn giao xe, quyết toán có giữ lại bảo hành.

### ▶ Chạy thử ngay, không cần cài gì

**[dat8103.github.io/gara-network](https://dat8103.github.io/gara-network/)** — demo tương tác chạy thẳng trong trình duyệt (kể cả điện thoại).

Đổi mức ưu tiên yêu cầu và xem hệ thống chọn garage khác; bỏ một lần bàn giao khỏi chuỗi và xem nó phát hiện lỗ hổng; thử trả cả phần giữ lại khi bảo hành chưa hết.

```bash
npm install
npm run demo     # vòng đời một ca sửa xe, in ra terminal
npm test         # 75 test
npm run serve    # mở bản demo web ở localhost
```

---

## Bối cảnh

| | |
|---|---|
| **Khách hàng** | Doanh nghiệp vận hành mạng lưới garage ô tô |
| **Vai trò của tôi** | Full-stack |
| **Thời gian** | 2025 |
| **Quy mô** | ~40 bảng · 70 migration · Laravel + React Router 7 |

**Vì sao là mạng lưới, không phải một garage lớn.** Mở một garage đủ năng lực làm mọi hạng mục cần vốn rất lớn và mất nhiều năm. Mạng lưới tận dụng năng lực nhàn rỗi của các garage đang có — đổi lại phải giải quyết ba bài toán mà một garage đơn lẻ không có: **chọn đối tác** cho từng ca, **bảo đảm chất lượng** khi không trực tiếp làm, và **giữ niềm tin của khách** khi xe rời khỏi tầm kiểm soát.

Ba module trong repo này là câu trả lời cho ba bài toán đó.

## Ba bài toán

### 1. Chọn đối tác — [`src/quoting.ts`](src/quoting.ts)

Bài toán khó không phải là so giá. Nó là: **rẻ nhất thường không phải tốt nhất.** Một garage báo rẻ hơn 15% nhưng cách xa 30km, đang quá tải, và điểm chất lượng thấp thì tổng chi phí thật cao hơn nhiều — khách chờ lâu, có khả năng phải làm lại, người điều phối tốn thời gian theo dõi.

Nhưng cũng không chọn bằng cảm tính được, vì người điều phối phải giải thích với khách, với kế toán, và với chính garage bị loại. Nên chọn bằng **điểm tổng hợp có trọng số**, mọi thành phần đều hiện ra để đọc.

Ba quyết định:

**Ba điều kiện loại thẳng, không cho điểm bù**: ngừng hoạt động, kín chỗ, không làm được hạng mục. Chuyên môn là ràng buộc cứng — gửi một xe hộp số tự động tới garage chỉ làm đồng sơn thì họ sẽ nhận rồi thuê ngoài, và chất lượng ra khỏi tầm kiểm soát của mạng lưới.

**Chuẩn hoá tương đối trong nhóm, không theo mốc tuyệt đối.** "Rẻ" chỉ có nghĩa khi so với các báo giá khác của cùng công việc đó; một mốc kiểu "dưới 2 triệu là rẻ" sẽ sai ngay khi gặp một ca sửa lớn.

**Yêu cầu khẩn đảo trọng số**: thời gian lên 40%, giá xuống 20%. Xe hỏng giữa đường thì khách cần xe chạy được, không cần rẻ hơn 300 nghìn. Dùng cùng một bộ trọng số cho mọi mức ưu tiên là bỏ qua chính lý do người điều phối đánh dấu một yêu cầu là khẩn — trong bộ dữ liệu demo, đổi sang mức khẩn làm hệ thống chọn một garage khác hẳn.

Khi garage thắng điểm không phải garage rẻ nhất, hệ thống **sinh sẵn câu giải thích** kèm số liệu. Người điều phối sẽ phải trả lời câu "sao không chọn chỗ rẻ hơn", và câu trả lời phải dựa trên số liệu chứ không phải cảm nhận.

Vòng báo giá cần **ít nhất hai** báo giá mới đủ cơ sở quyết định — một báo giá đơn độc thì không so được với gì. Ngoại lệ: khi mọi garage khác đã từ chối hoặc hết hạn, một báo giá là tất cả những gì có.

### 2. Chuỗi bàn giao xe — [`src/handover.ts`](src/handover.ts)

Xe là tài sản đắt tiền của khách, và trong một mạng lưới nó đi qua nhiều tay: khách → điều phối → garage → điều phối → khách. Mỗi lần chuyển tay là một lần có thể phát sinh tranh chấp: vết xước này có từ trước hay mới, xăng đầy hay vơi, đồng hồ chạy thêm bao nhiêu km.

Không có bằng chứng thì tranh chấp giải quyết bằng lời nói, và bên yếu thế hơn — thường là khách — chịu thiệt. Điều đó giết niềm tin vào cả mạng lưới, kể cả khi phần lớn garage làm ăn tử tế.

Mỗi lần chuyển tay ghi lại số km, mức nhiên liệu, hư hỏng nhìn thấy, ảnh chụp và **chữ ký cả hai bên**. Chỉ một bên ký thì biên bản là lời khai một phía, và nó vô giá trị đúng vào lúc cần đến nhất.

Module kiểm tra ba tính chất:

- **Chuỗi liền mạch** — bên nhận của lần trước phải là bên giao của lần sau. Đứt đoạn nghĩa là có một lần chuyển tay không được ghi nhận, và đó chính là khoảng thời gian không ai chịu trách nhiệm nếu xe hỏng.
- **Km không lùi** — đồng hồ không lùi được; lùi nghĩa là ghi sai, hoặc tệ hơn.
- **Xe quay về khách** khi công việc đã xong.

Giá trị thật nằm ở `chenhLechGiuaCacLan`: **bên chịu trách nhiệm là bên nhận của lần trước** — tức bên đã giữ xe trong khoảng giữa hai lần bàn giao. Mọi thay đổi trên xe quy được về đúng một bên, và không ai phải tranh cãi bằng trí nhớ.

Từ đó sinh cảnh báo: hư hỏng mới xuất hiện, xe chạy quá mức chạy thử hợp lý, nhiên liệu tụt mạnh. Chạy thử sau sửa là bình thường và cần thiết — nhưng vài chục km thì không còn là chạy thử, và khách phát hiện qua đồng hồ km thì mất niềm tin vào cả mạng lưới.

### 3. Quyết toán với đối tác — [`src/settlement.ts`](src/settlement.ts)

Hai chi tiết định hình toàn bộ module:

**Không phải hạng mục nào cũng chịu thuế.** Phụ tùng có hoá đơn thì chịu VAT; công thợ ở nhiều garage nhỏ thì không. Tính thuế trên tổng là tính sai, và sai theo hướng mạng lưới **trả thừa** — trong bộ dữ liệu demo, chênh lệch là 325 nghìn trên một phiếu.

**Giữ lại một phần cho tới hết hạn bảo hành.** Trả hết ngay thì khi xe hỏng lại trong thời gian bảo hành, garage không còn động lực tài chính để quay lại sửa — và mạng lưới là bên phải đứng ra chịu trách nhiệm với khách.

Ba chi tiết cài đặt:

- Hạn trả phần giữ lại tính từ **ngày hoàn thành công việc**, không phải ngày lập phiếu. Bảo hành bắt đầu chạy khi khách nhận xe, và hai mốc đó có thể cách nhau nhiều ngày nếu kế toán làm phiếu muộn.
- Phần giữ lại **không** tính vào "còn phải trả ngay" — nó là khoản có điều kiện, và trộn vào số nợ hiện tại sẽ làm cả kế toán lẫn garage hiểu nhầm là mạng lưới đang chậm trả.
- Hàm trả tiền **chặn** việc trả trước phần giữ lại khi bảo hành chưa hết. Trả sớm là làm mất chính cơ chế mà phần giữ lại sinh ra để bảo đảm.

Có thêm `doiChieuVoiBaoGia`: phát sinh trong lúc sửa là bình thường — mở máy ra mới thấy hết — nhưng phát sinh phải được duyệt **trước** khi làm, chứ không xuất hiện lần đầu trên phiếu quyết toán. Vượt ngưỡng 10% thì phiếu phải qua duyệt lại.

## Hạ tầng hệ thống thật

| Lớp | Công nghệ |
|---|---|
| Backend | PHP 8.2 · Laravel · MySQL · 70 migration |
| Frontend | React Router 7 · TypeScript · Vite |
| Phân quyền | Vai trò × module × hành động |
| Quy mô | ~40 bảng: yêu cầu · báo giá · đơn hàng · kho · quyết toán · bảo hành |

Chi tiết: [`docs/architecture.md`](docs/architecture.md) · [`docs/decisions.md`](docs/decisions.md)

## Phạm vi công khai

**Có trong repo:** lọc và chấm điểm garage, chọn báo giá kèm giải thích, kiểm tra chuỗi bàn giao và quy trách nhiệm, tính quyết toán, thanh toán có giữ lại, đối chiếu với báo giá — kèm 75 test và demo.

**Không có trong repo:** mã Laravel, giao diện React, schema database, cấu hình hạ tầng.

Mọi tên garage, tên khách, biển số và giá trong `demo/seed.ts` là **bịa hoàn toàn**.

## Giấy phép

[MIT](LICENSE) cho phần mã trong repo này.
