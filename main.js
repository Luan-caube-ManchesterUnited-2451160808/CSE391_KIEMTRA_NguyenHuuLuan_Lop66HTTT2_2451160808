// Bước 1: Khởi tạo mảng chứa danh sách phiếu mượn bằng cách đọc dữ liệu cũ từ Local Storage.
// Nếu chưa có gì, khởi tạo một mảng trống []
var borrowList = JSON.parse(localStorage.getItem("borrowList")) || [];

// Khi trang vừa load lên, lập tức vẽ bảng dữ liệu ra màn hình
renderData();

// Bắt sự kiện khi người dùng nhấn nút "Lưu phiếu" (Submit Form)
document
  .getElementById("borrowForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Ngăn trang web tự động tải lại
    handleFormSubmit(); // Gọi hàm xử lý lưu dữ liệu
  });

// --- HÀM 1: ĐỔ DỮ LIỆU TỪ MẢNG RA BẢNG HTML VÀ TÍNH THỐNG KÊ ---
function renderData() {
  var tbody = document.getElementById("borrowTableBody");
  tbody.innerHTML = ""; // Xóa sạch dữ liệu cũ trong bảng để vẽ lại

  var total = borrowList.length;
  var borrowing = 0;
  var returned = 0;

  // Sử dụng vòng lặp for cơ bản nhất cho sinh viên dễ hiểu
  for (var i = 0; i < borrowList.length; i++) {
    var item = borrowList[i];

    // Đếm số lượng trạng thái để làm thống kê
    if (item.status === "Đang mượn") {
      borrowing++;
    } else {
      returned++;
    }

    // Tạo ra một dòng <tr> mới
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" +
      item.borrowId +
      "</td>" +
      "<td>" +
      item.borrowerName +
      "</td>" +
      "<td>" +
      item.bookId +
      "</td>" +
      "<td>" +
      item.bookCategory +
      "</td>" +
      "<td>" +
      formatToVietnameseDate(item.borrowDate) +
      "</td>" +
      "<td>" +
      formatToVietnameseDate(item.returnDate) +
      "</td>" +
      "<td>" +
      item.status +
      "</td>" +
      "<td>" +
      "<button class='btn btn-edit' onclick='editBorrow(" +
      i +
      ")'>Sửa</button>" +
      "<button class='btn btn-delete' onclick='deleteBorrow(" +
      i +
      ")'>Xóa</button>" +
      "</td>";
    tbody.appendChild(tr);
  }

  // Đưa các số liệu đếm được lên các ô thống kê ở giao diện
  document.getElementById("totalBorrows").innerText = total;
  document.getElementById("borrowingCount").innerText = borrowing;
  document.getElementById("returnedCount").innerText = returned;
}

// --- HÀM 2: KIỂM TRA TÍNH HỢP LỆ CỦA DỮ LIỆU (VALIDATION) ---
function validateForm() {
  var isValid = true;

  // Lấy giá trị từ các ô nhập liệu
  var editIndex = parseInt(document.getElementById("editIndex").value);
  var borrowId = document.getElementById("borrowId").value.trim();
  var borrowerName = document.getElementById("borrowerName").value.trim();
  var bookId = document.getElementById("bookId").value.trim();
  var bookCategory = document.getElementById("bookCategory").value;
  var borrowDateStr = document.getElementById("borrowDate").value;
  var returnDateStr = document.getElementById("returnDate").value;
  var phoneNumber = document.getElementById("phoneNumber").value.trim();
  var email = document.getElementById("email").value.trim();
  var notes = document.getElementById("notes").value.trim();

  // Xóa sạch các thông báo lỗi cũ trước khi kiểm tra mới
  var errorFields = [
    "borrowId",
    "borrowerName",
    "bookId",
    "bookCategory",
    "borrowDate",
    "returnDate",
    "phoneNumber",
    "email",
    "notes",
  ];
  for (var i = 0; i < errorFields.length; i++) {
    document.getElementById("err-" + errorFields[i]).innerText = "";
  }

  // 1. Kiểm tra Mã phiếu mượn
  if (borrowId === "") {
    document.getElementById("err-borrowId").innerText =
      "Mã phiếu không được để trống.";
    isValid = false;
  } else if (!/^PM-\d{4}$/.test(borrowId)) {
    document.getElementById("err-borrowId").innerText =
      "Phải có dạng PM-XXXX (X là chữ số).";
    isValid = false;
  } else if (editIndex === -1) {
    // Nếu là thêm mới thì kiểm tra trùng mã
    for (var j = 0; j < borrowList.length; j++) {
      if (borrowList[j].borrowId === borrowId) {
        document.getElementById("err-borrowId").innerText =
          "Mã phiếu mượn này đã tồn tại.";
        isValid = false;
        break;
      }
    }
  }

  // 2. Kiểm tra Họ tên người mượn
  var nameRegex =
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠỨỨỬỮỰẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăâêôơứứửữựấầẩẫậắằẳẵặẹẻẽềềểếệốộớờởỡợ\s]+$/;
  if (borrowerName === "") {
    document.getElementById("err-borrowerName").innerText =
      "Họ tên không được để trống.";
    isValid = false;
  } else if (borrowerName.length < 2 || borrowerName.length > 40) {
    document.getElementById("err-borrowerName").innerText =
      "Họ tên phải từ 2 đến 40 ký tự.";
    isValid = false;
  } else if (!nameRegex.test(borrowerName)) {
    document.getElementById("err-borrowerName").innerText =
      "Họ tên chỉ chứa chữ cái và khoảng trắng.";
    isValid = false;
  }

  // 3. Kiểm tra Mã sách
  if (bookId === "") {
    document.getElementById("err-bookId").innerText =
      "Mã sách không được để trống.";
    isValid = false;
  } else if (!/^BK\d{5}$/.test(bookId)) {
    document.getElementById("err-bookId").innerText =
      "Phải bắt đầu bằng BK và 5 chữ số phía sau.";
    isValid = false;
  }

  // 4. Kiểm tra Thể loại sách
  if (bookCategory === "") {
    document.getElementById("err-bookCategory").innerText =
      "Vui lòng chọn một thể loại.";
    isValid = false;
  }

  // Thiết lập mốc thời gian ngày hôm nay (loại bỏ giờ phút giây để so sánh chuẩn)
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // 5. Kiểm tra Ngày mượn
  if (borrowDateStr === "") {
    document.getElementById("err-borrowDate").innerText =
      "Ngày mượn không được để trống.";
    isValid = false;
  } else {
    var bDate = new Date(borrowDateStr);
    bDate.setHours(0, 0, 0, 0);
    if (bDate > today) {
      document.getElementById("err-borrowDate").innerText =
        "Ngày mượn không được lớn hơn ngày hiện tại.";
      isValid = false;
    }
  }

  // 6. Kiểm tra Hạn trả
  if (returnDateStr === "") {
    document.getElementById("err-returnDate").innerText =
      "Hạn trả không được để trống.";
    isValid = false;
  } else if (borrowDateStr !== "") {
    var bDate = new Date(borrowDateStr);
    var rDate = new Date(returnDateStr);
    bDate.setHours(0, 0, 0, 0);
    rDate.setHours(0, 0, 0, 0);

    if (rDate < bDate) {
      document.getElementById("err-returnDate").innerText =
        "Hạn trả phải lớn hơn hoặc bằng ngày mượn.";
      isValid = false;
    } else {
      // Tính số ngày chênh lệch giữa ngày mượn và hạn trả
      var hieuThoiGian = rDate.getTime() - bDate.getTime();
      var soNgay = hieuThoiGian / (1000 * 60 * 60 * 24);
      if (soNgay > 30) {
        document.getElementById("err-returnDate").innerText =
          "Hạn trả không vượt quá 30 ngày kể từ ngày mượn.";
        isValid = false;
      }
    }
  }

  // 7. Kiểm tra Số điện thoại
  if (phoneNumber === "") {
    document.getElementById("err-phoneNumber").innerText =
      "Số điện thoại không được để trống.";
    isValid = false;
  } else if (!/^(03|05|07|08|09)\d{8}$/.test(phoneNumber)) {
    document.getElementById("err-phoneNumber").innerText =
      "SĐT gồm 10 số và phải bắt đầu bằng 03, 05, 07, 08, 09.";
    isValid = false;
  }

  // 8. Kiểm tra Email
  if (email === "") {
    document.getElementById("err-email").innerText =
      "Email không được để trống.";
    isValid = false;
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/.test(email)) {
    document.getElementById("err-email").innerText =
      "Email phải đúng định dạng và có đuôi @library.vn";
    isValid = false;
  }

  // 10. Ghi chú (Kiểm tra chống chèn thẻ HTML nguy hại)
  if (notes.length > 120) {
    document.getElementById("err-notes").innerText =
      "Ghi chú không được dài quá 120 ký tự.";
    isValid = false;
  } else if (/<script>|<iframe>|<img>/i.test(notes)) {
    document.getElementById("err-notes").innerText =
      "Ghi chú không được chứa các thẻ HTML độc hại.";
    isValid = false;
  }

  return isValid;
}

// --- HÀM 3: XỬ LÝ LƯU (THÊM HOẶC CẬP NHẬT PHIẾU) ---
function handleFormSubmit() {
  // Nếu kiểm tra validation thất bại, lập tức dừng lại không lưu
  if (validateForm() === false) {
    return;
  }

  // Thu thập tất cả thông tin người dùng điền vào thành 1 đối tượng Object
  var editIndex = parseInt(document.getElementById("editIndex").value);
  var statusValue = document.querySelector(
    'input[name="status"]:checked',
  ).value;

  var borrowData = {
    borrowId: document.getElementById("borrowId").value.trim(),
    borrowerName: document.getElementById("borrowerName").value.trim(),
    bookId: document.getElementById("bookId").value.trim(),
    bookCategory: document.getElementById("bookCategory").value,
    borrowDate: document.getElementById("borrowDate").value,
    returnDate: document.getElementById("returnDate").value,
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    email: document.getElementById("email").value.trim(),
    status: statusValue,
    notes: document.getElementById("notes").value.trim(),
  };

  if (editIndex === -1) {
    // Nếu editIndex là -1 tức là đang ở chế độ THÊM MỚI
    borrowList.push(borrowData);
  } else {
    // Ngược lại tức là đang ở chế độ CHỈNH SỬA dòng hiện tại
    borrowList[editIndex] = borrowData;
  }

  // Lưu mảng dữ liệu mới xuống Local Storage của trình duyệt
  localStorage.setItem("borrowList", JSON.stringify(borrowList));

  // Vẽ lại bảng dữ liệu trên giao diện ngay lập tức và đóng popup
  renderData();
  closeModal();
}

// --- HÀM 4: ĐỔ DỮ LIỆU CŨ LÊN FORM ĐỂ SỬA ---
function editBorrow(index) {
  var item = borrowList[index];

  // Mở popup lên và đổi tên tiêu đề
  openModal();
  document.getElementById("modalTitle").innerText = "Chỉnh Sửa Phiếu Mượn";

  // Đổ ngược dữ liệu từ mảng vào các ô input trên form
  document.getElementById("editIndex").value = index; // Ghi nhớ vị trí đang sửa
  document.getElementById("borrowId").value = item.borrowId;
  document.getElementById("borrowId").disabled = true; // Khóa mã phiếu mượn không cho chỉnh sửa

  document.getElementById("borrowerName").value = item.borrowerName;
  document.getElementById("bookId").value = item.bookId;
  document.getElementById("bookCategory").value = item.bookCategory;
  document.getElementById("borrowDate").value = item.borrowDate;
  document.getElementById("returnDate").value = item.returnDate;
  document.getElementById("phoneNumber").value = item.phoneNumber;
  document.getElementById("email").value = item.email;
  document.getElementById("notes").value = item.notes;

  // Chọn đúng nút radio Đang mượn / Đã trả
  var statusRadios = document.getElementsByName("status");
  for (var i = 0; i < statusRadios.length; i++) {
    if (statusRadios[i].value === item.status) {
      statusRadios[i].checked = true;
    }
  }
}

// --- HÀM 5: XÓA PHIẾU MƯỢN ---
function deleteBorrow(index) {
  var item = borrowList[index];

  // Hiển thị hộp thoại thông báo xác nhận của trình duyệt
  var xacNhan = confirm(
    "Bạn có chắc chắn muốn xóa mã phiếu " + item.borrowId + " không?",
  );

  if (xacNhan === true) {
    borrowList.splice(index, 1); // Xóa 1 phần tử tại vị trí index
    localStorage.setItem("borrowList", JSON.stringify(borrowList)); // Cập nhật lại bộ nhớ
    renderData(); // Cập nhật lại bảng và thống kê ngay lập tức
  }
}

// --- CÁC HÀM PHỤ TRỢ (BẬT TẮT POPUP, ĐỊNH DẠNG NGÀY THÁNG) ---
function openModal() {
  // Làm trống form và reset nút ẩn index về -1
  document.getElementById("borrowForm").reset();
  document.getElementById("editIndex").value = "-1";
  document.getElementById("borrowId").disabled = false; // Mở khóa cho phép nhập mã phiếu khi thêm mới

  // Xóa toàn bộ chữ báo lỗi cũ (nếu có)
  var errorMsgs = document.getElementsByClassName("error-msg");
  for (var i = 0; i < errorMsgs.length; i++) {
    errorMsgs[i].innerText = "";
  }

  // Hiển thị popup bằng thuộc tính CSS flex
  document.getElementById("borrowModal").style.display = "flex";
}

function closeModal() {
  // Ẩn popup đi
  document.getElementById("borrowModal").style.display = "none";
}

function formatToVietnameseDate(dateStr) {
  if (dateStr === "") return "";
  // Cắt chuỗi YYYY-MM-DD từ input date ra và xếp thành DD/MM/YYYY
  var parts = dateStr.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}
// --- ĐOẠN CODE TỰ ĐỘNG XÓA LỖI KHI NGƯỜI DÙNG NHẬP LẠI DỮ LIỆU ---

// Khi gõ vào ô Mã phiếu mượn
document.getElementById("borrowId").addEventListener("input", function () {
  document.getElementById("err-borrowId").innerText = "";
});

// Khi gõ vào ô Họ tên
document.getElementById("borrowerName").addEventListener("input", function () {
  document.getElementById("err-borrowerName").innerText = "";
});

// Khi gõ vào ô Mã sách
document.getElementById("bookId").addEventListener("input", function () {
  document.getElementById("err-bookId").innerText = "";
});

// Khi chọn lại Thể loại sách
document.getElementById("bookCategory").addEventListener("change", function () {
  document.getElementById("err-bookCategory").innerText = "";
});

// Khi chọn lại Ngày mượn
document.getElementById("borrowDate").addEventListener("change", function () {
  document.getElementById("err-borrowDate").innerText = "";
});

// Khi chọn lại Hạn trả
document.getElementById("returnDate").addEventListener("change", function () {
  document.getElementById("err-returnDate").innerText = "";
});

// Khi gõ vào ô Số điện thoại
document.getElementById("phoneNumber").addEventListener("input", function () {
  document.getElementById("err-phoneNumber").innerText = "";
});

// Khi gõ vào ô Email
document.getElementById("email").addEventListener("input", function () {
  document.getElementById("err-email").innerText = "";
});

// Khi gõ vào ô Ghi chú
document.getElementById("notes").addEventListener("input", function () {
  document.getElementById("err-notes").innerText = "";
});
