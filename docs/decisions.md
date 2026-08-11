# Nhật ký quyết định

---

## QĐ-01 · Chấm điểm nhiều tiêu chí, không chọn theo giá

**Đã cân nhắc.** Chọn báo giá rẻ nhất — đơn giản, không ai cãi được.

**Quyết định.** Điểm tổng hợp từ giá, chất lượng, thời gian, khoảng cách.

**Vì sao.** Rẻ nhất thường không phải tốt nhất. Một garage rẻ hơn 15% nhưng cách 30km, đang quá tải, điểm chất lượng thấp thì tổng chi phí thật cao hơn: khách chờ lâu, có khả năng phải làm lại, người điều phối tốn thời gian theo dõi.

**Cái giá.** Phải giải thích được vì sao không chọn chỗ rẻ hơn — nên hệ thống sinh sẵn câu giải thích kèm số liệu.

---

## QĐ-02 · Ba điều kiện loại thẳng, không cho điểm bù

**Quyết định.** Garage ngừng hoạt động, kín chỗ, hoặc không làm được hạng mục thì bị loại khỏi vòng, không tham gia chấm điểm.

**Vì sao không cho điểm bù.** Một garage kín chỗ mà báo giá cực rẻ vẫn có thể thắng điểm — và xe sẽ nằm chờ ở đó. Điểm bù chỉ hợp lý cho những yếu tố có thể đánh đổi; ba yếu tố này thì không.

**Chuyên môn là ràng buộc cứng nhất.** Gửi xe hộp số tự động tới garage chỉ làm đồng sơn thì họ sẽ nhận rồi thuê ngoài, và chất lượng ra khỏi tầm kiểm soát của mạng lưới — cùng lúc mạng lưới vẫn là bên chịu trách nhiệm với khách.

---

## QĐ-03 · Chuẩn hoá tương đối trong nhóm

**Đã cân nhắc.** Mốc tuyệt đối — "dưới 2 triệu là rẻ, trên 5 triệu là đắt".

**Quyết định.** Chuẩn hoá theo min/max của chính nhóm báo giá đang so.

**Vì sao.** "Rẻ" chỉ có nghĩa khi so với các báo giá khác của **cùng một công việc**. Thay lốp và đại tu động cơ không thể dùng chung một mốc, và duy trì bảng mốc theo từng hạng mục là việc không ai làm nổi.

**Trường hợp biên.** Mọi báo giá bằng nhau thì thành phần đó không phân biệt được ai hơn ai — cho tất cả điểm tối đa thay vì chia cho 0.

---

## QĐ-04 · Yêu cầu khẩn đảo trọng số

**Quyết định.** Mức khẩn: thời gian 40%, giá 20% (bình thường thì ngược lại).

**Vì sao.** Xe hỏng giữa đường thì khách cần xe chạy được, không cần rẻ hơn 300 nghìn. Dùng cùng một bộ trọng số cho mọi mức ưu tiên là bỏ qua chính lý do người điều phối đánh dấu một yêu cầu là khẩn.

**Kiểm chứng.** Có test khẳng định cùng một bộ báo giá cho ra hai lựa chọn khác nhau ở hai mức ưu tiên — nếu không thì tham số này chỉ là trang trí.

---

## QĐ-05 · Luôn sinh câu giải thích khi không chọn cái rẻ nhất

**Quyết định.** Kết quả chọn kèm một câu nêu rõ đắt hơn bao nhiêu phần trăm và bù lại được gì.

**Vì sao.** Người điều phối sẽ phải trả lời câu "sao không chọn chỗ rẻ hơn" — từ khách, từ kế toán, hoặc từ chính garage bị loại. Câu trả lời phải dựa trên số liệu chứ không phải cảm nhận, và nó phải có sẵn ngay lúc đó chứ không phải dựng lại sau.

---

## QĐ-06 · Cần ít nhất hai báo giá để quyết định

**Quyết định.** Vòng báo giá chỉ "đủ cơ sở quyết định" khi có từ hai báo giá trở lên.

**Vì sao.** Một báo giá đơn độc thì không so được với gì, và người điều phối không có cơ sở nào để bảo vệ lựa chọn đó — kể cả với chính mình.

**Ngoại lệ.** Khi mọi garage khác đã từ chối hoặc hết hạn, một báo giá là tất cả những gì có. Chặn cứng ở đây sẽ khiến xe của khách nằm chờ vì một quy tắc hình thức.

---

## QĐ-07 · Vòng báo giá có hạn phản hồi

**Quyết định.** Quá hạn không trả lời thì báo giá chuyển `het_han`, vòng khép lại.

**Vì sao.** Garage không trả lời không phải lỗi của họ — họ bận. Nhưng nếu vòng không khép lại đúng hạn thì một garage im lặng sẽ giữ xe của khách nằm chờ vô thời hạn.

---

## QĐ-08 · Bàn giao cần chữ ký cả hai bên

**Quyết định.** Thiếu chữ ký một bên thì bàn giao không hợp lệ.

**Vì sao.** Chỉ một bên ký thì tờ biên bản là lời khai một phía, và nó vô giá trị đúng vào lúc cần đến nhất — lúc có tranh chấp.

**Kèm theo.** Yêu cầu tối thiểu 4 ảnh. Ảnh là thứ duy nhất không tranh cãi được về tình trạng xe tại một thời điểm.

---

## QĐ-09 · Bên chịu trách nhiệm là bên nhận của lần trước

**Quyết định.** Mọi chênh lệch giữa hai lần bàn giao quy về bên đã **giữ** xe trong khoảng đó.

**Vì sao.** Đây là toàn bộ giá trị của việc ghi chuỗi. Không có nó thì mỗi bên đổ cho bên kia và tranh chấp giải quyết bằng trí nhớ — trong đó khách luôn là bên yếu thế nhất.

**Hệ quả.** Chuỗi phải liền mạch. Đứt đoạn nghĩa là có một lần chuyển tay không được ghi, và đó chính là khoảng thời gian không ai chịu trách nhiệm.

---

## QĐ-10 · Số km không được lùi

**Quyết định.** Coi số km giảm giữa hai lần bàn giao là lỗ hổng dữ liệu.

**Vì sao.** Đồng hồ km không lùi được. Lùi nghĩa là ghi sai — hoặc tệ hơn, có người can thiệp. Cả hai đều cần người xem lại.

---

## QĐ-11 · Chạy thử có ngưỡng, vượt thì cảnh báo

**Quyết định.** Xe chạy quá 30km khi ở garage thì sinh cảnh báo.

**Vì sao.** Chạy thử sau sửa là bình thường và cần thiết — chặn hẳn là sai. Nhưng vài chục km thì không còn là chạy thử, và khách phát hiện ra qua đồng hồ km thì mất niềm tin vào cả mạng lưới, không riêng garage đó.

**Là cảnh báo, không phải chặn.** Có ca cần chạy xa để tái hiện lỗi. Người điều phối đọc cảnh báo và quyết định.

---

## QĐ-12 · Thuế chỉ tính trên hạng mục chịu thuế

**Bối cảnh.** Phụ tùng có hoá đơn thì chịu VAT; công thợ ở nhiều garage nhỏ thì không.

**Quyết định.** Tách từng dòng quyết toán theo cờ `chiuThue`.

**Vì sao.** Tính thuế trên tổng là tính sai, và sai theo hướng **mạng lưới trả thừa**. Với bộ dữ liệu demo, chênh lệch là 325 nghìn trên một phiếu — nhân với vài trăm phiếu mỗi tháng thì không còn nhỏ.

---

## QĐ-13 · Giữ lại một phần tới hết bảo hành

**Đã cân nhắc.** Trả hết ngay sau nghiệm thu — garage thích hơn, quan hệ đối tác dễ hơn.

**Quyết định.** Giữ lại 10% cho tới hết hạn bảo hành.

**Vì sao.** Trả hết ngay thì khi xe hỏng lại trong thời gian bảo hành, garage không còn động lực tài chính để quay lại sửa — và mạng lưới là bên phải đứng ra chịu trách nhiệm với khách. Phần giữ lại là thứ duy nhất giữ cho cam kết bảo hành có giá trị thật.

**Cài đặt.** Hàm trả tiền **chặn** việc trả trước phần giữ lại. Không có chốt này thì một thao tác vô ý ở kế toán làm mất luôn cơ chế bảo đảm.

---

## QĐ-14 · Hạn bảo hành tính từ ngày hoàn thành công việc

**Quyết định.** Không tính từ ngày lập phiếu quyết toán.

**Vì sao.** Bảo hành bắt đầu chạy khi khách nhận xe. Kế toán làm phiếu muộn vài ngày — hoặc vài tuần — là chuyện thường, và tính từ ngày lập phiếu sẽ kéo dài thời gian giữ tiền của garage một cách vô lý.

---

## QĐ-15 · Phần giữ lại không tính vào "còn phải trả ngay"

**Quyết định.** Tách riêng hai con số trong màn hình công nợ.

**Vì sao.** Phần giữ lại là khoản **có điều kiện**. Trộn nó vào số nợ hiện tại sẽ làm cả kế toán lẫn garage hiểu nhầm là mạng lưới đang chậm trả — và đó là loại hiểu nhầm làm hỏng quan hệ đối tác mà không ai nhận ra nguyên nhân.

---

## QĐ-16 · Phát sinh phải duyệt trước khi làm

**Quyết định.** Quyết toán vượt báo giá quá 10% thì phiếu phải qua duyệt lại.

**Vì sao.** Phát sinh trong lúc sửa là bình thường — mở máy ra mới thấy hết. Nhưng phát sinh phải được duyệt **trước** khi làm, chứ không xuất hiện lần đầu trên phiếu quyết toán khi công việc đã xong và không còn lựa chọn nào ngoài trả tiền.

**Ngưỡng 10%** cho biên độ với sai số ước tính thông thường, đủ chặt để một hạng mục lớn không lọt qua.
