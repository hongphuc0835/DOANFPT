import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'dart:math';



const primaryColor = Colors.blue;
const whiteColor = Color.fromARGB(255, 255, 255, 255);
const blackColor = Color.fromARGB(255, 0, 0, 0);
const blueColor = Color.fromARGB(255, 33, 150, 233);

class Appointment extends StatefulWidget {
  final bool isLoggedIn;
  final VoidCallback onLogout;
  final int? patientId;
  final VoidCallback onNavigateToHomePage;

  const Appointment(
      {super.key,
      required this.isLoggedIn,
      required this.onLogout,
      this.patientId,
      required this.onNavigateToHomePage});

  @override
  _AppointmentState createState() => _AppointmentState();

}

class StepBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepLabels;

  const StepBar({
    super.key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepLabels,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(totalSteps, (index) {
            return Expanded(
              child: Column(
                children: [
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4.0),
                    height: 8.0,
                    decoration: BoxDecoration(
                      color: index + 1 < currentStep
                          ? Colors.green
                          : index + 1 == currentStep
                              ? primaryColor
                              : Colors.black54,
                      borderRadius: BorderRadius.circular(4.0),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    stepLabels[index],
                    style: TextStyle(
                      color: index + 1 < currentStep
                          ? Colors.green
                          : index + 1 == currentStep
                              ? primaryColor
                              : Colors.black54,
                      fontSize: 14.0,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _AppointmentState extends State<Appointment> {
  int step = 1;
  bool showSuccess = false;

  final _patientNameController = TextEditingController();
  final _patientEmailController = TextEditingController();
  final _patientPhoneController = TextEditingController();

  List departments = [];
  List doctors = [];
  List<Map<String, dynamic>> availableSlots = [];
  List bookedSlots = [];
  List lockedSlots = [];
  String? selectedDepartment;
  String? selectedDoctor;
  String? selectedDay;
  String? selectedTimeSlot;
  Timer? _timer;
  bool isDateSelected = false;
  bool isLoading = false;
  bool isLoadingSlots = false;
  bool isLoadingDepartment = false;
  bool isLoadingDoctor = false;
  final _formKeyStep2 = GlobalKey<FormState>();
  TextEditingController departmentController = TextEditingController();
  List filteredDepartments = [];
  OverlayEntry? _departmentOverlayEntry;
  final LayerLink _layerLink = LayerLink();
  final FocusNode _departmentFocusNode = FocusNode();
  final GlobalKey _searchKey = GlobalKey();

  TextEditingController doctorController = TextEditingController();
  List filteredDoctors = [];
  OverlayEntry? _doctorOverlayEntry;
  final LayerLink _doctorLayerLink = LayerLink();
  final FocusNode _doctorFocusNode = FocusNode();
  final GlobalKey _doctorSearchKey = GlobalKey();

  // Danh sách các khung giờ
  List<Map<String, dynamic>> timeSlots = [
    {
      'label': '08:00 AM - 09:00 AM',
      'value': 1,
      'start': '08:00',
      'end': '09:00'
    },
    {
      'label': '09:00 AM - 10:00 AM',
      'value': 2,
      'start': '09:00',
      'end': '10:00'
    },
    {
      'label': '10:00 AM - 11:00 AM',
      'value': 3,
      'start': '10:00',
      'end': '11:00'
    },
    {
      'label': '11:00 AM - 12:00 PM',
      'value': 4,
      'start': '11:00',
      'end': '12:00'
    },
    {
      'label': '01:00 PM - 02:00 PM',
      'value': 5,
      'start': '13:00',
      'end': '14:00'
    },
    {
      'label': '02:00 PM - 03:00 PM',
      'value': 6,
      'start': '14:00',
      'end': '15:00'
    },
    {
      'label': '03:00 PM - 04:00 PM',
      'value': 7,
      'start': '15:00',
      'end': '16:00'
    },
    {
      'label': '04:00 PM - 05:00 PM',
      'value': 8,
      'start': '16:00',
      'end': '17:00'
    }
  ];

  @override
  void initState() {
    super.initState();
    fetchDepartments();
    filteredDepartments = [];
    filteredDoctors = [];
  }

// Hàm hiển thị overlay cho Department với giao diện được cải tiến
  void _showDepartmentOverlay() {
    final renderBox = _searchKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final position = renderBox.localToGlobal(Offset.zero);
    final size = renderBox.size;
    if (_departmentOverlayEntry != null) {
      _departmentOverlayEntry!.markNeedsBuild();
      return;
    }
    _departmentOverlayEntry = OverlayEntry(
      builder: (context) {
        return Positioned(
          left: 16,                     // padding từ mép trái
          right: 16,                    // padding từ mép phải
          top: position.dy + size.height + 4,  // khoảng cách nhỏ dưới TextField
          child: Material(
            elevation: 8,
            borderRadius: BorderRadius.circular(12),
            shadowColor: Colors.black26,
            color: Colors.white,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200, width: 1),
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 300),
                child: filteredDepartments.isEmpty
                    ? Container(
                  padding: const EdgeInsets.all(16),
                  child: const Text(
                    'No departments found',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 14,
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                )
                    : ListView.separated(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  shrinkWrap: true,
                  itemCount: filteredDepartments.length,
                  separatorBuilder: (context, index) => Divider(
                    height: 1,
                    thickness: 0.5,
                    color: Colors.grey.shade200,
                    indent: 16,
                    endIndent: 16,
                  ),
                  itemBuilder: (context, index) {
                    final dept = filteredDepartments[index];
                    return InkWell(
                      onTap: () {
                        setState(() {
                          departmentController.text = dept['department_name'];
                          selectedDepartment = dept['department_id'].toString();
                          selectedDoctor = null;
                          doctors = [];
                          filteredDepartments = [];
                          fetchDoctors(selectedDepartment!);
                        });
                        _removeDepartmentOverlay();
                        _departmentFocusNode.unfocus();
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: primaryColor.withOpacity(0.7),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                dept['department_name'],
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black87,
                                  fontSize: 15,
                                ),
                              ),
                            ),
                            // Icon(
                            //   Icons.arrow_forward_ios,
                            //   size: 14,
                            //   color: Colors.grey.shade400,
                            // ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        );
      },
    );
    Overlay.of(context)?.insert(_departmentOverlayEntry!);
  }

  void _removeDepartmentOverlay() {
    _departmentOverlayEntry?.remove();
    _departmentOverlayEntry = null;
  }

// Hàm hiển thị overlay cho Doctor với giao diện được cải tiến
  void _showDoctorOverlay() {
    final renderBox = _doctorSearchKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final position = renderBox.localToGlobal(Offset.zero);
    final size = renderBox.size;

    if (_doctorOverlayEntry != null) {
      _doctorOverlayEntry!.markNeedsBuild();
      return;
    }

    _doctorOverlayEntry = OverlayEntry(
      builder: (context) {
        return Positioned(
          left: 16,                     // padding từ mép trái
          right: 16,                    // padding từ mép phải
          top: position.dy + size.height + 4,  // khoảng cách nhỏ dưới TextField
          child: Material(
            elevation: 8,
            borderRadius: BorderRadius.circular(12),
            shadowColor: Colors.black26,
            color: Colors.white,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200, width: 1),
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 300),
                child: filteredDoctors.isEmpty
                    ? Container(
                  padding: const EdgeInsets.all(16),
                  child: const Text(
                    'No doctors found',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 14,
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                )
                    : ListView.separated(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  shrinkWrap: true,
                  itemCount: filteredDoctors.length,
                  separatorBuilder: (context, index) => Divider(
                    height: 1,
                    thickness: 0.5,
                    color: Colors.grey.shade200,
                    indent: 16,
                    endIndent: 16,
                  ),
                  itemBuilder: (context, index) {
                    final doctor = filteredDoctors[index];
                    return InkWell(
                      onTap: () {
                        setState(() {
                          doctorController.text = doctor['doctor_name'];
                          selectedDoctor = doctor['doctor_id'].toString();
                          filteredDoctors = [];
                        });
                        _removeDoctorOverlay();
                        _doctorFocusNode.unfocus();
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: primaryColor.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.person,
                                color: primaryColor,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    doctor['doctor_name'],
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      color: Colors.black87,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Dr. ${doctor['doctor_name'].split(' ').last}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: Colors.green.shade200,
                                  width: 0.5,
                                ),
                              ),
                              child: Text(
                                'Available',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.green.shade700,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        );
      },
    );
    Overlay.of(context)?.insert(_doctorOverlayEntry!);
  }

  void _removeDoctorOverlay() {
    _doctorOverlayEntry?.remove();
    _doctorOverlayEntry = null;
  }

  String generatePassword() {
    const String lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const String upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const String numbers = '0123456789';
    const String specialCharacters = '@#\$%^&*()_+!';

    const String allCharacters =
        lowerCase + upperCase + numbers + specialCharacters;
    final Random random = Random();

    // Generate the password
    String password = List.generate(8, (index) {
      return allCharacters[random.nextInt(allCharacters.length)];
    }).join();

    return password;
  }

  OverlayEntry? currentOverlayEntry;

  void showTemporaryMessage(BuildContext context, String message) {
    if (currentOverlayEntry != null) {
      currentOverlayEntry!.remove();
    }

    currentOverlayEntry = OverlayEntry(
      builder: (context) => Center(
        child: Material(
          color: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.all(12.0),
            margin: const EdgeInsets.only(left: 12, right: 12),
            decoration: BoxDecoration(
              color: blackColor.withOpacity(0.7),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Text(
              message,
              style: const TextStyle(
                  color: whiteColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );

    Overlay.of(context).insert(currentOverlayEntry!);

    Future.delayed(const Duration(seconds: 3), () {
      currentOverlayEntry?.remove();
      currentOverlayEntry = null;
    });
  }

  // Lấy danh sách khoa
  Future<void> fetchDepartments() async {
    setState(() {
      isLoadingDepartment = true;
    });
    final url = Uri.parse(
        'http://10.0.2.2:8081/api/v1/departments/list');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        setState(() {
          departments = json.decode(response.body);
        });
      } else {
        print('Lỗi khi lấy danh sách khoa!');
      }
    } catch (error) {
      print('Lỗi: $error');
    }
    setState(() {
      isLoadingDepartment = false;
    });
  }



  // Lấy danh sách bác sĩ theo khoa
  Future<void> fetchDoctors(String departmentId) async {
    setState(() {
      isLoadingDoctor = true;
    });
    final url = Uri.parse(
        'http://10.0.2.2:8081/api/v1/departments/$departmentId/doctors');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        setState(() {
          doctors = json.decode(response.body);
        });
      } else {
        print('Lỗi khi lấy danh sách bác sĩ!');
      }
    } catch (error) {
      print('Lỗi: $error');
    }
    setState(() {
      isLoadingDoctor = false;
    });
  }

  // Lấy các slot có sẵn của bác sĩ theo ngày
  Future<void> fetchAvailableSlots(String doctorId, String day) async {
    setState(() {
      isLoadingSlots = true;
    });
    final url = Uri.parse(
        'http://10.0.2.2:8081/api/v1/appointments/$doctorId/slots?date=$day');
    try {
      print(
          'Fetching available slots for doctorId: $doctorId on date: $day'); // In thông tin để kiểm tra
      final response = await http.get(url);

      print(
          'Response status: ${response.statusCode}'); // In ra mã trạng thái phản hồi
      if (response.statusCode == 200) {
        print('Response body: ${response.body}'); // In ra chi tiết phản hồi

        setState(() {
          bookedSlots = json.decode(response.body); // Nhận các slot đã đặt
          print('Booked slots: $bookedSlots'); // In ra các slot đã được đặt
          filterAvailableSlots(); // Lọc các slot còn trống
        });
      } else {
        print(
            'Error fetching slots: Status Code ${response.statusCode}, Response: ${response.body}'); // In chi tiết lỗi
      }
    } catch (error) {
      print('Error occurred: $error'); // In ra chi tiết lỗi
    }
  }

  // Lấy các slot bị khóa
  Future<void> fetchLockedSlots(String doctorId, String day) async {
    final url = Uri.parse(
        'http://10.0.2.2:8081/api/v1/appointments/check-locked-slots?doctorId=$doctorId&date=$day');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        setState(() {
          lockedSlots = json.decode(response.body); // Lưu lại các slot bị khóa
          filterAvailableSlots(); // Cập nhật danh sách slot
        });
      } else {
        print('Lỗi khi lấy các slot bị khóa!');
      }
    } catch (error) {
      print('Lỗi: $error');
    }
  }

  // Lọc các slot còn trống và loại bỏ slot đã được đặt, slot đang bị khóa, và slot quá khứ
  void filterAvailableSlots() {
    setState(() {
      DateTime currentTime = DateTime.now();

      availableSlots = timeSlots.where((slot) {
        bool isPastTime = false;
        bool isBooked = false; // Biến để kiểm tra slot đã đặt

        if (selectedDay != null) {
          DateTime selectedDate = DateTime.parse(selectedDay!);
          DateTime today = DateTime.now();

          // Kiểm tra nếu là ngày hôm nay, ẩn các slot trong quá khứ
          if (selectedDate.year == today.year &&
              selectedDate.month == today.month &&
              selectedDate.day == today.day) {
            final slotStartTime = DateTime(
                today.year,
                today.month,
                today.day,
                int.parse(slot['start'].split(':')[0]),
                int.parse(slot['start'].split(':')[1]));

            isPastTime = slotStartTime.isBefore(currentTime);
          }

          // Kiểm tra nếu slot đã được đặt trong bookedSlots
          isBooked = bookedSlots.any((bookedSlot) =>
              bookedSlot['slot'] == slot['value'] &&
              bookedSlot['medical_day'] == selectedDay!.substring(0, 10));
        }

        // Trả về các slot chưa được đặt và không phải là slot trong quá khứ
        return !isBooked && !isPastTime;
      }).toList();
      isLoadingSlots = false;
    });
  }

  // Gửi yêu cầu khóa slot về backend và khóa slot trong 5 phút
  Future<void> lockSlotTemporarily(String slotValue) async {
    try {
      final response = await http.post(
        Uri.parse(
            'http://10.0.2.2:8081/api/v1/appointments/lock-slot'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'doctorId': selectedDoctor,
          'date': selectedDay,
          'time': slotValue,
        }),
      );

      if (response.statusCode == 200) {
        setState(() {
          selectedTimeSlot = slotValue;
        });

        // Sau 5 phút sẽ tự động mở khóa nếu người dùng không xác nhận
        _timer?.cancel();
        _timer = Timer(const Duration(minutes: 5), () {
          unlockSlot(slotValue);
        });
      } else if (response.statusCode == 409) {
        // Slot đã bị khóa bởi người khác
        showTemporaryMessage(
            context, "This slot is unavailable. Please select another slot.");
      } else {
        print('Lỗi khi khóa slot!');
      }
    } catch (error) {
      print('Lỗi khi gửi yêu cầu khóa slot: $error');
    }
  }

  // Gửi yêu cầu mở khóa slot về backend sau 5 phút
  Future<void> unlockSlot(String slotValue) async {
    try {
      await http.post(
        Uri.parse(
            'http://10.0.2.2:8081/api/v1/appointments/unlock-slot'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'doctorId': selectedDoctor,
          'date': selectedDay,
          'time': slotValue,
        }),
      );
    } catch (error) {
      print('Lỗi khi mở khóa slot: $error');
    }
  }



  // Bước 1: Chọn khoa, bác sĩ, ngày giờ khám
  Widget buildFormStep1() {
    return Column(
      children: [
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 20),
          alignment: Alignment.center,
          child: const Text(
            'Select',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: primaryColor,
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Department Search Field
        Container(
          key: _searchKey,
          margin: const EdgeInsets.only(top: 20.0),
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.black54, width: 1.0),
          ),
          child: CompositedTransformTarget(
            link: _layerLink,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    focusNode: _departmentFocusNode,
                    controller: departmentController,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                    onChanged: (value) {
                      setState(() {
                        filteredDepartments = departments.where((dept) {
                          return dept['department_name']
                              .toLowerCase()
                              .contains(value.toLowerCase());
                        }).toList();

                        if (filteredDepartments.isNotEmpty && value.isNotEmpty) {
                          _showDepartmentOverlay();
                        } else {
                          _removeDepartmentOverlay();
                        }
                      });
                    },
                    onTap: () {
                      setState(() {
                        filteredDepartments = departments;
                      });
                      if (filteredDepartments.isNotEmpty) {
                        _showDepartmentOverlay();
                      }
                    },
                    decoration: const InputDecoration(
                      hintText: 'Select Department',
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const Icon(Icons.arrow_drop_down, color: Colors.black54),
              ],
            ),
          ),
        ),

        // Doctor Search Field
        Container(
          key: _doctorSearchKey,
          margin: const EdgeInsets.only(top: 20.0),
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.black54, width: 1.0),
          ),
          child: CompositedTransformTarget(
            link: _doctorLayerLink,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    focusNode: _doctorFocusNode,
                    controller: doctorController,
                    enabled: selectedDepartment != null,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                    onChanged: (value) {
                      setState(() {
                        filteredDoctors = doctors.where((doctor) {
                          return doctor['doctor_name']
                              .toLowerCase()
                              .contains(value.toLowerCase());
                        }).toList();

                        if (filteredDoctors.isNotEmpty && value.isNotEmpty) {
                          _showDoctorOverlay();
                        } else {
                          _removeDoctorOverlay();
                        }
                      });
                    },
                    onTap: () {
                      if (selectedDepartment == null) {
                        showTemporaryMessage(context, "Please select a department first!");
                        return;
                      }
                      setState(() {
                        filteredDoctors = doctors;
                      });
                      if (filteredDoctors.isNotEmpty) {
                        _showDoctorOverlay();
                      }
                    },
                    decoration: InputDecoration(
                      hintText: selectedDepartment == null
                          ? 'Select Department First'
                          : isLoadingDoctor
                          ? 'Loading Doctors...'
                          : 'Select Doctor',
                      hintStyle: TextStyle(
                        color: selectedDepartment == null ? Colors.red : Colors.black54,
                        fontWeight: FontWeight.bold,
                      ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                if (isLoadingDoctor)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                    ),
                  )
                else
                  const Icon(Icons.arrow_drop_down, color: Colors.black54),
              ],
            ),
          ),
        ),

        // Date Selection
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 20.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            border: Border.all(
              color: Colors.black54,
              width: 1.0,
            ),
          ),
          child: InkWell(
            onTap: () async {
              if (selectedDoctor == null) {
                showTemporaryMessage(context, "Please select a doctor first!");
              } else {
                final selected = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 30)),
                  builder: (BuildContext context, Widget? child) {
                    return Theme(
                      data: ThemeData.light().copyWith(
                        primaryColor: primaryColor,
                        hintColor: primaryColor,
                        colorScheme:
                        const ColorScheme.light(primary: primaryColor),
                        buttonTheme: const ButtonThemeData(
                            textTheme: ButtonTextTheme.primary),
                      ),
                      child: child!,
                    );
                  },
                );
                if (selected != null) {
                  setState(() {
                    selectedDay = selected.toIso8601String();
                    isDateSelected = true;
                    if (selectedDoctor != null && selectedDay != null) {
                      fetchAvailableSlots(selectedDoctor!, selectedDay!);
                      fetchLockedSlots(selectedDoctor!, selectedDay!);
                    }
                  });
                }
              }
            },
            child: Padding(
              padding:
              const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    selectedDay != null
                        ? selectedDay!.substring(0, 10)
                        : 'Select Date',
                    style: TextStyle(
                        color: isDateSelected ? blackColor : Colors.black54,
                        fontSize: 16.0,
                        fontWeight: FontWeight.bold),
                  ),
                  const Icon(Icons.calendar_month_rounded, color: blackColor),
                ],
              ),
            ),
          ),
        ),

        // Time Slots
        if (isDateSelected)
          isLoadingSlots
              ? Center(
            child: Container(
              margin: const EdgeInsets.only(top: 20),
              child: const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
              ),
            ),
          )
              : buildTimeSlots(),
        const SizedBox(height: 20),

        // Next Step Button
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: 20),
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              padding: const EdgeInsets.symmetric(vertical: 15),
            ),
            onPressed: () {
              if (selectedDepartment == null ||
                  selectedDoctor == null ||
                  selectedDay == null ||
                  selectedTimeSlot == null) {
                showTemporaryMessage(context,
                    "Please fill all fields before going to the next step.");
              } else {
                setState(() {
                  step = 2;
                });
              }
            },
            child: const Text(
              'Next Step',
              style: TextStyle(
                  color: whiteColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  // Bước 2: Nhập thông tin khách hàng
  Widget buildFormStep2() {
    return Form(
      key: _formKeyStep2,
      child: Column(
        children: [
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(top: 20),
            alignment: Alignment.center,
            child: const Text(
              'Enter Information',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: primaryColor,
              ),
            ),
          ),
          const SizedBox(
            height: 40,
          ),
          SizedBox(
            width: double.infinity,
            child: TextFormField(
              controller: _patientNameController,
              cursorColor: Colors.black54,
              style: const TextStyle(
                  color: blackColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                prefixIcon: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Icon(
                    Icons.person,
                    color: Colors.black54,
                  ),
                ),
                hintText: 'Full Name',
                hintStyle: TextStyle(
                    color: Colors.black54,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorStyle: TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Name cannot be empty';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: TextFormField(
              controller: _patientEmailController,
              keyboardType: TextInputType.emailAddress,
              cursorColor: Colors.black54,
              style: const TextStyle(
                  color: blackColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                prefixIcon: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Icon(
                    Icons.email,
                    color: Colors.black54,
                  ),
                ),
                hintText: 'Email Address',
                hintStyle: TextStyle(
                    color: Colors.black54,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorStyle: TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Email address cannot be empty';
                }
                if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                  return 'Invalid email address';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: TextFormField(
              controller: _patientPhoneController,
              keyboardType: TextInputType.number,
              cursorColor: Colors.black54,
              style: const TextStyle(
                  color: blackColor,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold),
              decoration: const InputDecoration(
                prefixIcon: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Icon(
                    Icons.phone_outlined,
                    color: Colors.black54,
                  ),
                ),
                hintText: 'Phone Number',
                hintStyle: TextStyle(
                    color: Colors.black54,
                    fontSize: 16.0,
                    fontWeight: FontWeight.bold),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.black54, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.red,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                errorStyle: TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.bold),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Phone number cannot be empty';
                }
                if (!RegExp(r'^\d+$').hasMatch(value)) {
                  return 'Phone number must contain only digits';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(top: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.45,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: whiteColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      side: const BorderSide(
                        color: primaryColor,
                        width: 1,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                    onPressed: () {
                      setState(() {
                        step = 1;
                      });
                    },
                    child: const Text(
                      'Prev Step',
                      style: TextStyle(
                          color: primaryColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.45,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                    onPressed: () {
                      if (_formKeyStep2.currentState!.validate()) {
                        setState(() {
                          step = 3;
                        });
                      }
                    },
                    child: const Text(
                      'Next Step',
                      style: TextStyle(
                          color: whiteColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Bước 3: Xác nhận thông tin đặt lịch
  Widget buildFormStep3() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tiêu đề
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(top: 20),
            alignment: Alignment.center,
            child: const Text(
              'Information',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: primaryColor,
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Thông tin đặt lịch
          _buildInfoRow('Full Name:', _patientNameController.text),
          _buildInfoRow('Email Address:', _patientEmailController.text),
          _buildInfoRow('Phone Number:', _patientPhoneController.text),
          _buildInfoRow(
              'Department:',
              departments.firstWhere((dept) =>
                  dept['department_id'].toString() ==
                  selectedDepartment)['department_name']),
          _buildInfoRow(
              'Doctor:',
              doctors.firstWhere((doc) =>
                  doc['doctor_id'].toString() ==
                  selectedDoctor)['doctor_name']),
          _buildInfoRow('Appointment Date:',
              selectedDay != null ? selectedDay!.substring(0, 10) : ''),
          _buildInfoRow(
              'Appointment Time:',
              timeSlots.firstWhere((slot) =>
                  slot['value'].toString() == selectedTimeSlot)['label']),

          const SizedBox(height: 30),

          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(top: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.45,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: whiteColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                        side: const BorderSide(
                          color: primaryColor,
                          width: 1,
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                    onPressed: () {
                      setState(() {
                        step = 2;
                      });
                    },
                    child: const Text(
                      'Prev Step',
                      style: TextStyle(
                          color: primaryColor,
                          fontSize: 16.0,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                SizedBox(
                  width: MediaQuery.of(context).size.width * 0.45,
                  child: ElevatedButton(
                    onPressed: handleAppointmentSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                    child: const Text('Finish',
                        style: TextStyle(
                            color: whiteColor,
                            fontSize: 16.0,
                            fontWeight: FontWeight.bold)),
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

// Hàm xây dựng hàng thông tin
  Widget _buildInfoRow(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: blackColor)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: Colors.black54,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Hiển thị các khung giờ
  Widget buildTimeSlots() {
    return Container(
      margin: const EdgeInsets.only(top: 20),
      width: double.infinity,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (availableSlots.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 15.0, horizontal: 10.0),
              child: Text(
                'No available slots. Please select a different date or doctor.',
                style: TextStyle(
                  color: Colors.black54,
                  fontSize: 16.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )
          else
            Container(
              margin: const EdgeInsets.only(bottom: 20, top: 10),
              child: const Text(
                'Select Slot',
                style: TextStyle(
                  color: primaryColor,
                  fontSize: 22.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          Wrap(
            spacing: 5.0,
            runSpacing: 5.0,
            alignment: WrapAlignment.center,
            children: availableSlots.map((slot) {
              return SizedBox(
                width: MediaQuery.of(context).size.width * 0.45,
                child: ChoiceChip(
                  backgroundColor: whiteColor,
                  label: Container(
                    alignment: Alignment.center,
                    height: 25,
                    child: Text(
                      slot['label'],
                      style: TextStyle(
                          fontSize: 14,
                          color: selectedTimeSlot == slot['value'].toString()
                              ? whiteColor
                              : blackColor,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  labelPadding: EdgeInsets.zero,
                  selected: selectedTimeSlot == slot['value'].toString(),
                  selectedColor: primaryColor,
                  showCheckmark: false,
                  onSelected: (bool selected) {
                    if (selected) {
                      lockSlotTemporarily(slot['value'].toString());
                    }
                  },
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                    side: const BorderSide(
                      color: primaryColor,
                      width: 1.0,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Future<void> handleAppointmentSubmit() async {
    setState(() {
      isLoading = true;
    });
    String patientPassword = generatePassword();

    final appointmentData = {
      'patient_name': _patientNameController.text,
      'patient_email': _patientEmailController.text,
      'patient_phone': _patientPhoneController.text,
      'patient_username': _patientEmailController.text,
      'patient_password': patientPassword,
      'department_id': int.tryParse(selectedDepartment ?? '0'),
      'doctor_id': int.tryParse(selectedDoctor ?? '0'),
      'medical_day': selectedDay,
      'slot': int.tryParse(selectedTimeSlot ?? '0'),
      'appointment_date': DateTime.now().toIso8601String(),
    };

    final url = Uri.parse(
        'http://10.0.2.2:8081/api/v1/appointments/insert');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(appointmentData),
      );

      if (response.statusCode == 200) {
        setState(() {
          showSuccess = true;
          setState(() {
            isLoading = false;
          });
          showTemporaryMessage(context, "Appointment booked successfully!");
        });
      } else {
        showTemporaryMessage(
            context, "Booking appointment failed. Please try again.");
        setState(() {
          isLoading = false;
        });
      }
    } catch (error) {
      showTemporaryMessage(
          context, "Error during booking appointment. Please try again.");
      print('Error: $error');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _removeDepartmentOverlay();
    _removeDoctorOverlay();
    _departmentFocusNode.dispose();
    _doctorFocusNode.dispose();
    departmentController.dispose();
    doctorController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Scaffold(
          backgroundColor: whiteColor,
          appBar: AppBar(
            title: Container(
              alignment: Alignment.center,
              child: Text(
                step == 1
                    ? 'Select Department & Doctor'
                    : step == 2
                    ? 'Fill Patient Information'
                    : showSuccess
                    ? 'Appointment Success'
                    : 'Confirm Booking Information',
                style: const TextStyle(
                  color: whiteColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
            ),
            backgroundColor: primaryColor,
          ),

          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                StepBar(
                  currentStep: showSuccess ? 4 : step,
                  totalSteps: 3,
                  stepLabels: const ['Step 1', 'Step 2', 'Step 3'],
                ),
                const SizedBox(height: 20),
                showSuccess
                    ? Center(
                        child: Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(top: 20),
                          child: Column(
                            children: [
                              const Icon(Icons.check_circle,
                                  size: 60, color: Colors.green),
                              const SizedBox(height: 10),
                              const Text('Appointment booked successfully!',
                                  style: TextStyle(
                                      fontSize: 20,
                                      color: blackColor,
                                      fontWeight: FontWeight.bold)),
                              const SizedBox(height: 40),
                              Container(
                                width: double.infinity,
                                margin: const EdgeInsets.only(top: 20),
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: primaryColor,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(15),
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 15),
                                  ),
                                  onPressed: () {
                                    Navigator.pushNamed(
                                        context, '/appointment_list');
                                  },
                                  child: const Text(
                                    'View Appointment',
                                    style: TextStyle(
                                        color: whiteColor,
                                        fontSize: 16.0,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              Container(
                                width: double.infinity,
                                margin: const EdgeInsets.only(top: 20),
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: whiteColor,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(15),
                                    ),
                                    side: BorderSide(
                                        color: primaryColor, width: 0.5),
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 15),
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      step = 1;
                                      showSuccess = false;
                                    });
                                  },
                                  child: const Text(
                                    'Booking another appointment',
                                    style: TextStyle(
                                        color: primaryColor,
                                        fontSize: 16.0,
                                        fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : step == 1
                        ? buildFormStep1()
                        : step == 2
                            ? buildFormStep2()
                            : buildFormStep3(),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),

        // Lớp phủ loading toàn màn hình
        if (isLoading)
          Positioned.fill(
            child: Container(
              color: blackColor.withOpacity(0.1),
              child: const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
