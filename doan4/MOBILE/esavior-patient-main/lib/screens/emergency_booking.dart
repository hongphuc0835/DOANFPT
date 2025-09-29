import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:web_socket_channel/io.dart';

import 'chat_message.dart';

const primaryColor = Colors.blue;
const whiteColor = Color.fromARGB(255, 255, 255, 255);
const blackColor = Color.fromARGB(255, 0, 0, 0);
const blueColor = Color.fromARGB(255, 33, 150, 233);

class EmergencyBooking extends StatefulWidget {
  @override
  _EmergencyBookingState createState() => _EmergencyBookingState();
}

class _EmergencyBookingState extends State<EmergencyBooking> {
  final _formKey = GlobalKey<FormState>();
  String patientName = '';
  String email = '';
  String phoneNumber = '';
  String ambulanceType = 'Standard Ambulance';
  bool useCurrentLocation = false;
  bool useMapForDestination = false;
  LatLng? _currentLocation;
  LatLng? _hospitalLocation;
  LatLng? _destinationLocation;
  double _currentZoom = 15.0;
  final MapController _mapController = MapController();
  StreamSubscription<Position>? _positionStream;
  double? _estimatedCost;
  bool isLoading = false;
  bool isSuccessBooked = false;
  bool updateLocation = false;
  bool getDriverLocation = true;
  String _driverName = '';
  String _driverPhone = '';
  String? driverName;
  String? driverPhone;
  LatLng? _driverLocation;
  Timer? _locationTimer;
  String _bookingId = '';
  String _driverId = '';
  bool activeLocation = false;
  int? driverId2;
  int? patientId;
  int? bookingId1;
  Timer? _timer;
  IOWebSocketChannel? _channel; // Biến toàn cục để lưu WebSocket channel
  List<ChatMessage> messages = []; // Danh sách lưu trữ tin nhắn
  bool openSocket = false;
  Stream? broadcastStream;

  @override
  void initState() {
    super.initState();
    _loadHospitals(); // Tải danh sách bệnh viện
    _loadMarkerPositions(); // Khôi phục lại vị trí tài xế và các thông tin đã lưu
    _startTrackingLocation(); // Bắt đầu theo dõi vị trí
    _loadBookingStatus(); // Kiểm tra trạng thái đặt chỗ
  }

  Future<void> _getDriverLocationAndUpdateMap(int? driverId) async {
    print('Đang lấy vị trí tài xế...');
    print(driverId.toString() + " day la id ai xe");
    try {
      // Gọi API với driverId được truyền qua đường dẫn
      final response = await http.get(
        Uri.parse(
            'http://10.0.2.2:8080/api/patientlocation/get-driver-location/$driverId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final double latitude = data['latitude'];
        final double longitude = data['longitude'];
        LatLng driverLocation = LatLng(latitude, longitude);
        print(driverLocation.toString() + " toa do tai xe");

        setState(() {
          _driverLocation = driverLocation;
          // Cập nhật vị trí tài xế trên bản đồ nếu cần
          // _mapController.move(_driverLocation!, _currentZoom);
        });
      } else {
        print(
            'Failed to load driver location. Status Code: ${response.statusCode}');
        print('Response body: ${response.body}');
      }
    } catch (e) {
      print('Error fetching driver location: $e');
    }
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

  void resetScreen() {
    print("Resetting screen with context: $context");
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => EmergencyBooking(),
      ),
    );
  }

  Future<void> callPhoneNumber(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );

    if (await canLaunch(launchUri.toString())) {
      await launch(launchUri.toString());
    } else {
      throw 'Could not launch $launchUri';
    }
  }

  Future<void> _saveMarkerPositions() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setDouble('currentLat', _currentLocation!.latitude);
    prefs.setDouble('currentLng', _currentLocation!.longitude);
    prefs.setDouble('destinationLat', _destinationLocation!.latitude);
    prefs.setDouble('destinationLng', _destinationLocation!.longitude);
    prefs.setString('driverName', _driverName);
    prefs.setString('driverPhone', _driverPhone); // Lưu driverPhone
    prefs.setString('bookingId', _bookingId);
    prefs.setString('driverId', _driverId);
  }

  Future<void> _loadMarkerPositions() async {
    final prefs = await SharedPreferences.getInstance();
    final double? currentLat = prefs.getDouble('currentLat');
    final double? currentLng = prefs.getDouble('currentLng');
    final double? destinationLat = prefs.getDouble('destinationLat');
    final double? destinationLng = prefs.getDouble('destinationLng');
    final String? driverName = prefs.getString('driverName');
    final String? driverPhone = prefs.getString('driverPhone');
    final String? bookingId = prefs.getString('bookingId');
    final String? driverId = prefs.getString('driverId');

    // Kiểm tra nếu có dữ liệu thì mới khôi phục trạng thái
    if (currentLat != null &&
        currentLng != null &&
        destinationLat != null &&
        destinationLng != null) {
      setState(() {
        _currentLocation = LatLng(currentLat, currentLng);
        _destinationLocation = LatLng(destinationLat, destinationLng);
        _driverName = driverName!;
        _driverPhone = driverPhone!;
        _bookingId = bookingId!;
        _driverId = driverId!;
        _locationTimer = Timer.periodic(Duration(seconds: 5), (Timer timer) {
          try {
            print("id tài xế " +
                driverId2.toString() +
                " đang lấy vị trí tài xế hoặc  " +
                _driverId.toString());
            _getDriverLocationAndUpdateMap(int.parse(_driverId));
            if (!updateLocation) {
              if (_currentLocation != null) {
                print(_currentLocation);
                _sendLocationUpdate();
              }
            }
          } catch (e) {
            print('Error converting driver ID to int: $e');
          }
        });
        if (_bookingId != null) {
          _openWebSocketConnection(int.parse(_bookingId));
        }
      });
      print(_driverId);
    } else {
      // Nếu không có dữ liệu, bạn có thể để trống
      print("Không có dữ liệu đã lưu");
    }
  }

  void _loadBookingStatus() async {
    print('load booking status');
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      isSuccessBooked = prefs.getBool('isSuccessBooked') ?? false;
    });
  }

  Future<void> _clearBookingStatus() async {
    print("=== Cập nhật trạng thái driver sau khi clear booking====");
    print(driverId2 ?? _driverId);

    String status1 = "Active";
    if (driverId2 != null) {
      await _updateDriverStatus(driverId2, status1);
    } else {
      await _updateDriverStatus(int.parse(_driverId), status1);
    }
    print('Chuyển trạng thái thành đã xong');

    // Xóa tất cả các dữ liệu trong SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Thêm dòng này để xóa hết dữ liệu đã lưu

    // Cập nhật trạng thái ban đầu
    if (_locationTimer != null) {
      _locationTimer!.cancel();
      print("Timer stopped");
    }

    setState(() {
      isSuccessBooked = false; // Đặt lại trạng thái đặt chỗ
      _hospitalLocation = null; // Xóa vị trí bệnh viện
      _destinationLocation = null; // Xóa vị trí điểm đến
      _driverName = ''; // Xóa tên tài xế
      _driverPhone = ''; // Xóa số điện thoại tài xế
      _driverId = ''; // Xóa ID tài xế
      _bookingId = ''; // Xóa ID đặt chỗ
    });

    print("Calling resetScreen");

    // Đợi một khoảng thời gian nhỏ trước khi reset màn hình
    Future.delayed(Duration(milliseconds: 100), () {
      resetScreen();
    });
  }

  Future<void> _updateDriverStatus(int? driverId, String status) async {
    try {
      print("driver_id" + driverId.toString() + "status la:" + status);
      final response = await http.post(
        Uri.parse(
            'http://10.0.2.2:8080/api/drivers/update-status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'driverId': driverId,
          'status': status,
        }),
      );

      if (response.statusCode == 200) {
        print("Driver status updated successfully!");
      } else {
        print('Error: ${response.statusCode}, ${response.body}');
      }
    } catch (error) {
      print('Exception: $error');
    }
  }

  Future<void> _upDateBookingStatus(int? bookingId1) async {
    print('thuc hien goi aPi chuyen trang thai booking sang complete');
    try {
      String status = 'Completed';

      print('Booking ID:' + bookingId1.toString());
      print('Booking Status: $status');

      // Thay thế URL API của bạn vào đây
      final response = await http.post(
        Uri.parse(
            'http://10.0.2.2:8080/api/bookings/update-status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'bookingStatus': status,
          'bookingId': bookingId1,
        }),
      );

      if (response.statusCode == 200) {
        showTemporaryMessage(context, "Emergency booking complete!");
        print('goi clearBooking');
        _clearBookingStatus();
      } else {
        showTemporaryMessage(context, "Error during submit, Please try again.");
        print('Error: ${response.statusCode}, ${response.body}');
      }
    } catch (error) {
      showTemporaryMessage(context, "Error during submit, Please try again.");
      print('Exception: $error');
    }
  }

  // Danh sách bệnh viện và danh sách gợi ý
  List<Map<String, dynamic>> allHospitals = [];
  TextEditingController hospitalNameController = TextEditingController();
  TextEditingController destinationController = TextEditingController();

  final List<String> ambulanceTypes = [
    'Standard Ambulance',
    'Advanced Life Support Ambulance'
  ];

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

  Future<void> _loadHospitals() async {
    print('tai danh sach benh vien');
    try {
      final response = await http.get(Uri.parse(
          'http://10.0.2.2:8080/api/hospitals/all'));
      if (response.statusCode == 200) {
        List<dynamic> hospitalsData = json.decode(response.body);
        setState(() {
          allHospitals = hospitalsData
              .map((e) => {
                    'hospitalName': e['hospitalName'],
                    'latitude': e['latitude'],
                    'longitude': e['longitude'],
                  })
              .toList();
        });
      } else {
        print('Failed to load hospitals');
      }
    } catch (e) {
      print('Error loading hospitals: $e');
    }
  }

  Future<void> _sendLocationUpdate() async {
    print('gui vi tri GPS len server');
    if (_currentLocation != null) {
      final response = await http.post(
        Uri.parse(
            'http://10.0.2.2:8080/api/patientlocation/update'),
        // Đường dẫn tới API cập nhật vị trí
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'patientId': patientId,
          'latitude': _currentLocation!.latitude,
          'longitude': _currentLocation!.longitude,
          // Thêm các dữ liệu cần thiết khác nếu có
        }),
      );

      if (response.statusCode == 200) {
        print("Location update successful");
      } else {
        print("Error updating location: ${response.statusCode}");
      }
    }
  }

  void _startTrackingLocation() {
    print('cap nhat vi tri lien tuc len map ');
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high, distanceFilter: 10),
    ).listen((Position position) {
      setState(() {
        _currentLocation = LatLng(position.latitude, position.longitude);
      });
      print(_currentLocation);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_currentLocation != null) {
          _mapController.move(_currentLocation!, _currentZoom);
        }
      });
    });
  }

  void _showHospitalSuggestions({bool isDestination = false}) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return ListView.builder(
          itemCount: allHospitals.length,
          itemBuilder: (context, index) {
            return ListTile(
              title: Text(allHospitals[index]['hospitalName']),
              onTap: () {
                setState(() {
                  if (isDestination) {
                    // Cập nhật vị trí điểm đến
                    destinationController.text =
                        allHospitals[index]['hospitalName'];
                    _destinationLocation = LatLng(
                      allHospitals[index]['latitude'],
                      allHospitals[index]['longitude'],
                    );
                    _mapController.move(_destinationLocation!, _currentZoom);
                  } else {
                    // Tắt sử dụng vị trí hiện tại và cập nhật vị trí điểm đi
                    useCurrentLocation = false; // Tắt vị trí hiện tại
                    hospitalNameController.text =
                        allHospitals[index]['hospitalName'];
                    _hospitalLocation = LatLng(
                      allHospitals[index]['latitude'],
                      allHospitals[index]['longitude'],
                    );
                    _currentLocation =
                        _hospitalLocation; // Cập nhật _currentLocation thành vị trí bệnh viện
                    _mapController.move(_hospitalLocation!, _currentZoom);
                  }
                  _calculateCost(); // Tính lại chi phí sau khi chọn vị trí
                });
                Navigator.pop(context);
              },
            );
          },
        );
      },
    );
  }

  Future<void> _calculateCost() async {
    print('ham tinh tien');
    setState(() {
      isLoading = true;
    });
    if (_currentLocation != null && _destinationLocation != null) {
      // Gửi request tới API tính chi phí
      final response = await http.post(
        Uri.parse(
            'http://10.0.2.2:8080/api/bookings/calculate-cost'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'startLatitude': _currentLocation!.latitude,
          'startLongitude': _currentLocation!.longitude,
          'destinationLatitude': _destinationLocation!.latitude,
          'destinationLongitude': _destinationLocation!.longitude,
        }),
      );

      if (response.statusCode == 200) {
        final costData = json.decode(response.body);
        print(response.body);
        final distance = costData['distance'];
        final cost = costData['costInUSD'];

        setState(() {
          _estimatedCost = cost;
        });

        showTemporaryMessage(context,
            'Distance: ${distance.toStringAsFixed(2)} km - Estimated cost: ${cost.toStringAsFixed(2)} USD.');
      } else {
        showTemporaryMessage(context, 'Error in calculating estimated cost.');
      }
    }
    setState(() {
      isLoading = false;
    });
  }

  Future<void> _submitForm() async {
    setState(() {
      isLoading = true;
    });
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      print('kiem tra email');
      print('Full name entered: $patientName');
      print('Email entered: $email');
      print('Phone entered: $phoneNumber');
      // Kiểm tra giá trị patientName

      // Kiểm tra email
      final checkEmailResponse = await http.post(
        Uri.parse(
            'http://10.0.2.2:8080/api/patients/check'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email}),
      );

      if (checkEmailResponse.statusCode == 200) {
        final emailExists = json.decode(checkEmailResponse.body);

        if (emailExists) {
          print('email da co thuc hien cap nhat thong tin');
          // Cập nhật thông tin bệnh nhân
          final updateUserResponse = await http.put(
            Uri.parse(
                'http://10.0.2.2:8080/api/patients/update'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'email': email,
              'phoneNumber': phoneNumber,
              'patientName': patientName,
            }),
          );

          if (updateUserResponse.statusCode == 200) {
            final updatePatientData = json.decode(updateUserResponse.body);

            // Lấy patientId từ phản hồi
            final patientIdUpdate =
                updatePatientData['patientId']; // Đảm bảo DTO có trường này
            patientId = patientIdUpdate;
            await _bookEmergencyAmbulance();
          } else {
            print('Error fetching patient data');
          }
        } else {
          print('khong co email , dang ki benh nhan moi');
          // Đăng ký bệnh nhân mới
          final registerUserResponse = await http.post(
            Uri.parse(
                'http://10.0.2.2:8080/api/patients/register'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({
              'email': email,
              'phoneNumber': phoneNumber,
              'patientName': patientName,
              'password': generatePassword(),
            }),
          );

          if (registerUserResponse.statusCode == 201) {
            ;
            final registeredPatientData =
                json.decode(registerUserResponse.body);

            // Lấy patientId từ phản hồi
            final patientIdRegister =
                registeredPatientData['patientId']; // Đảm bảo DTO có trường này
            patientId = patientIdRegister;
            print('Registered patientId: $patientId');
            await _bookEmergencyAmbulance();
          } else {
            print('Error while registering new user');
          }
        }
      } else {
        print('Error checking email');
      }
    }
  }

  Future<void> _bookEmergencyAmbulance() async {
    print('thuc hien dat don booking');
    LatLng? bookingLocation;
    String? pickupAddress;

    if (useCurrentLocation && _currentLocation != null) {
      bookingLocation = _currentLocation;
      pickupAddress = 'Current location';
    } else if (hospitalNameController.text.isNotEmpty) {
      final selectedHospital = allHospitals.firstWhere((hospital) =>
          hospital['hospitalName'] == hospitalNameController.text);
      bookingLocation =
          LatLng(selectedHospital['latitude'], selectedHospital['longitude']);
      pickupAddress = hospitalNameController.text;
    }

    if (bookingLocation != null && _estimatedCost != null) {
      final bookingData = {
        'patient': {'email': email},
        'bookingType': 'Emergency',
        'pickupAddress': pickupAddress,
        'latitude': bookingLocation.latitude,
        'longitude': bookingLocation.longitude,
        'pickupTime': DateTime.now().toIso8601String(),
        'destinationLatitude': _destinationLocation?.latitude,
        'destinationLongitude': _destinationLocation?.longitude,
        'cost': _estimatedCost, // Thêm giá vào dữ liệu đặt xe
        'ambulanceType': ambulanceType, // Loại xe cứu thương
      };

      try {
        final response = await http.post(
          Uri.parse(
              'http://10.0.2.2:8080/api/bookings/emergency'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode(bookingData),
        );
        print("du lieu ínsert booking " + bookingData.toString());
        if (response.statusCode == 200 || response.statusCode == 201) {
          final bookingResponse = json.decode(response.body); // Lấy phản hồi
          bookingId1 = bookingResponse['bookingId'];
          startCheckingBookingStatus(bookingId1);
          print(bookingId1.toString() +
              " =========== booking Id"); // Lấy bookingId từ phản hồi API
          _bookingId = bookingId1.toString();
          _openWebSocketConnection(int.parse(
              _bookingId)); // Tạo kết nối WebSocket với role là "customer"
          _findNearestDriver(
              bookingId1); // Gửi bookingId vào hàm _findNearestDriver

          final prefs = await SharedPreferences.getInstance();
          await prefs.setBool('isSuccessBooked', true);
          _saveMarkerPositions();
          setState(() {
            isSuccessBooked = true;
          });
          showTemporaryMessage(
              context, 'Emergency ambulance booking successfully!');
        } else {
          showTemporaryMessage(
              context, 'Error in booking emergency ambulance!');
        }
      } catch (e) {
        showTemporaryMessage(context, 'Connection error while booking: $e');
      }
    } else {
      showTemporaryMessage(
          context, 'Estimated costs have not been calculated.');
    }
    setState(() {
      isLoading = false;
    });
  }

  Future<void> _checkBookingStatus(int? bookingId1) async {
    try {
      // Gọi API để kiểm tra trạng thái booking
      final response = await http.get(Uri.parse(
          'http://10.0.2.2:8080/api/bookings/$bookingId1'));
      print('check status booking with booking ' + bookingId1.toString());
      if (response.statusCode == 200) {
        // Parse JSON
        final bookingData = jsonDecode(response.body);
        // Kiểm tra nếu `type` là 'Completed'
        if (bookingData['bookingStatus'] == 'Completed') {
          _clearBookingStatus();
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => EmergencyBooking()),
          );
        }
      } else {
        print('Failed to load booking');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  void startCheckingBookingStatus(int? bookingId1) {
    _timer = Timer.periodic(Duration(seconds: 5), (Timer timer) async {
      await _checkBookingStatus(bookingId1);
    });
  }

  void _openWebSocketConnection(int? bookingId, {Function? setStateDialog}) {
    // Kiểm tra xem WebSocket đã được mở hay chưa, nếu chưa thì mở kết nối
    if (_channel == null) {
      // Kết nối WebSocket với role là "customer"
      _channel = IOWebSocketChannel.connect(
          'ws://10.0.2.2:8080/ws/common?id=$bookingId&role=customer');

      // Chuyển đổi thành BroadcastStream và đảm bảo không bị null
      broadcastStream = _channel!.stream.asBroadcastStream();
      print("_channel connected");

      // Lắng nghe dữ liệu từ WebSocket
      broadcastStream!.listen((message) {
        // Không cần dấu hỏi vì đã chắc chắn không null
        if (message.isNotEmpty) {
          print("Received from WebSocket: $message");

          // Lấy giá trị 'message' từ chuỗi WebSocket nhận được
          RegExp regex = RegExp(r'message=([^,}]+)');
          Match? match = regex.firstMatch(message);
          if (match != null) {
            String mess = match.group(1) ?? '';
            print('Received message: $mess');

            // Cập nhật danh sách tin nhắn
            if (setStateDialog != null) {
              setStateDialog(() {
                messages.add(ChatMessage(message: mess));
                print("Updated message in dialog");
              });
            } else {
              setState(() {
                messages.add(ChatMessage(message: mess));
                print("Updated message without dialog");
              });
            }
          }
        }
      }, onDone: () {
        print("WebSocket closed , tiến hành kết nối lại");
        _openWebSocketConnection(int.parse(_bookingId));
      }, onError: (error) {
        // Log lỗi chi tiết
        print("WebSocket error: $error , tiến hành kết nối lại");
        _openWebSocketConnection(int.parse(_bookingId));
      });

      openSocket = true; // Đặt trạng thái đã mở WebSocket
    }
  }


// Hàm gửi tin nhắn có thể gọi ở bất kỳ đâu sau khi WebSocket đã kết nối
  void sendMessage(int? bookingId, String message) {
    if (_channel != null && message.isNotEmpty) {
      // Tạo dữ liệu JSON với role là "customer"
      print('Booking id là :' + bookingId.toString() + "mess là :" + message);
      Map<String, dynamic> data = {
        'type': 'send_message',
        'id': bookingId,
        'role': 'customer',  // Role là khách hàng
        'message': message
      };

      // Gửi dữ liệu qua WebSocket
      _channel!.sink.add(jsonEncode(data));
      print("json gui di " + jsonEncode(data).toString());
      print("Sent message: $message with bookingId: ${bookingId.toString()}");
    } else {
      print("WebSocket channel is not connected or message is empty.");
    }
  }




  Future<void> _findNearestDriver(int? bookingId) async {
    print('bat dau tim tai xe ');
    print('toa do:' + _currentLocation.toString());
    if (_currentLocation != null) {
      final requestBody = json.encode({
        'latitude': _currentLocation!.latitude,
        'longitude': _currentLocation!.longitude,
        'bookingId': bookingId,
      });

      // In chuỗi JSON ra để kiểm tra
      print('JSON đang gửi: $requestBody');
      try {
        final nearestDriverResponse = await http.post(
          Uri.parse(
              'http://10.0.2.2:8080/api/drivers/nearest'),
          headers: {'Content-Type': 'application/json'},
          body: requestBody,
        );

        print(nearestDriverResponse.body);

        if (nearestDriverResponse.statusCode == 200) {
          final nearestDriverData = json.decode(nearestDriverResponse.body);

          if (nearestDriverData != null && nearestDriverData.isNotEmpty) {
            // Lọc tài xế có status là "Active"
            print('active');
            final activeDrivers = nearestDriverData
                .where((driver) => driver['status'] == 'Active')
                .toList();

            if (activeDrivers.isNotEmpty) {
              // Lấy tài xế đầu tiên trong danh sách tài xế active
              // Sử dụng int.tryParse để chuyển đổi driverId an toàn
              // Hiển thị thông báo tài xế gần nhất
              showTemporaryMessage(context,
                  'Nearest active driver: ${activeDrivers[0]['driverPhone']}, Name: ${activeDrivers[0]['driverName']}');
              _driverName = activeDrivers[0]['driverName'];
              _driverPhone = activeDrivers[0]['driverPhone'];
              driverPhone = _driverPhone;
              driverName = _driverName;
              _driverId = activeDrivers[0]['driverId'].toString();
              _saveMarkerPositions();
              print(driverName);
              print(driverPhone);
              final driverIdStr = activeDrivers[0]['driverId'].toString();
              final driverId = int.tryParse(driverIdStr);
              driverId2 = driverId;
              if (driverId != null) {
                String status = "Deactive";
                await _updateDriverStatus(
                    driverId2, status); // Chuyển driverId sang chuỗi
                print('ok');
                // Cập nhật đơn đặt xe với driverId và bookingId
                await _updateBookingWithDriverId(driverId, bookingId1);
                getDriverLocation = true;
                if (updateLocation == false) {
                  _locationTimer =
                      Timer.periodic(Duration(seconds: 5), (Timer timer) {
                    try {
                      print("id tài xế " +
                          driverId2.toString() +
                          " đang lấy vị trí tài xế");
                      _getDriverLocationAndUpdateMap(driverId2);
                      if (!updateLocation) {
                        if (_currentLocation != null) {
                          print(_currentLocation);
                          _sendLocationUpdate();
                        }
                      }
                    } catch (e) {
                      print('Error converting driver ID to int: $e');
                    }
                  });
                  print(driverId.toString() +
                      " dang cap nhat gui vi tri + thu vi tri");
                }
              } else {
                print("Error converting driver ID to int");
                showTemporaryMessage(context, 'Invalid driver ID');
              }
            } else {
              showTemporaryMessage(context, 'No active drivers found nearby');
              return;
            }
          } else {
            showTemporaryMessage(
                context, 'No nearest driver information found');
            return;
          }
        } else {
          showTemporaryMessage(context,
              'Error finding driver: ${nearestDriverResponse.statusCode}');
          return;
        }
      } catch (e) {
        showTemporaryMessage(context, 'Connection error: $e');
        return;
      }
    } else {
      showTemporaryMessage(context, 'Unable to get current location');
      return;
    }
    setState(() {
      isLoading = false;
    });
  }

// Hàm cập nhật đơn đặt xe với driverId
  Future<void> _updateBookingWithDriverId(int driverId, int? bookingId) async {
    print('cap nhat don dat xe');
    try {
      final response = await http.put(
        Uri.parse(
            'http://10.0.2.2:8080/api/bookings/update-driver/$bookingId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'driverId': driverId, // Gửi driverId để cập nhật đơn đặt xe
        }),
      );

      if (response.statusCode == 200) {
        showTemporaryMessage(
            context, 'Booking updated with driverId: $driverId');
      } else {
        showTemporaryMessage(context, 'Error updating booking with driverId');
      }
    } catch (e) {
      showTemporaryMessage(
          context, 'Connection error while updating booking: $e');
    }
  }

  void _fitMarkers() {
    List<LatLng> markerPoints = [];

    if (_currentLocation != null) {
      markerPoints.add(_currentLocation!);
    }
    if (_hospitalLocation != null) {
      markerPoints.add(_hospitalLocation!);
    }
    if (_destinationLocation != null) {
      markerPoints.add(_destinationLocation!);
    }
    if (_driverLocation != null) {
      markerPoints.add(_driverLocation!);
    }

    if (markerPoints.isNotEmpty) {
      // Tính toán LatLngBounds từ danh sách marker points
      LatLngBounds bounds = LatLngBounds.fromPoints(markerPoints);

      // Fit bản đồ với LatLngBounds này
      _mapController.fitBounds(
        bounds,
        options: const FitBoundsOptions(
            padding: EdgeInsets.all(50)), // Thêm padding để không sát với cạnh
      );
    }
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    _channel?.sink.close();    // Đảm bảo đóng WebSocket
    hospitalNameController.dispose();
    destinationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      Scaffold(
        backgroundColor: whiteColor,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(
              Icons.arrow_back,
              color: whiteColor,
              size: 25,
            ),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
          backgroundColor: primaryColor,
        ),
        body: isSuccessBooked
            ? Stack(
                children: [
                  SizedBox(
                    height: double.infinity,
                    width: double.infinity,
                    child: FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        center: _currentLocation ??
                            _hospitalLocation ??
                            LatLng(20.99167, 105.845),
                        zoom: _currentZoom,
                        onMapReady: _fitMarkers, // Gọi hàm khi map đã sẵn sàng
                      ),
                      children: [
                        TileLayer(
                          urlTemplate:
                              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                          subdomains: ['a', 'b', 'c'],
                        ),
                        if (_currentLocation != null ||
                            _hospitalLocation != null ||
                            _destinationLocation != null)
                          MarkerLayer(
                            markers: [
                              Marker(
                                width: 80.0,
                                height: 80.0,
                                point: _currentLocation != null
                                    ? _currentLocation!
                                    : (_hospitalLocation ??
                                        LatLng(20.99167, 105.845)),
                                builder: (ctx) => const Icon(Icons.location_pin,
                                    color: primaryColor, size: 40.0),
                              ),
                              if (_destinationLocation != null)
                                Marker(
                                  width: 80.0,
                                  height: 80.0,
                                  point: _destinationLocation!,
                                  builder: (ctx) => const Icon(Icons.flag,
                                      color: Colors.green, size: 40.0),
                                ),
                              if (_driverLocation != null)
                                Marker(
                                  width: 80.0,
                                  height: 80.0,
                                  point: _driverLocation!,
                                  builder: (ctx) => const Icon(
                                      Icons.directions_car,
                                      color: blueColor,
                                      size: 40.0),
                                ),
                            ],
                          ),
                      ],
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      width: double.infinity,
                      color: whiteColor,
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              // Nút "Call Driver"
                              ElevatedButton.icon(
                                onPressed: () async {
                                  final Uri launchUri = Uri(
                                    scheme: 'tel',
                                    path: driverPhone ?? _driverPhone,
                                  );
                                  await launch(launchUri.toString());
                                },
                                icon: const Icon(Icons.call, color: whiteColor), // Icon cho nút "Call"
                                label: const Text(
                                  'Call Driver',
                                  style: TextStyle(
                                    color: whiteColor,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: primaryColor,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                ),
                              ),

                              // Nút "Message Driver"
                              ElevatedButton.icon(
                                onPressed: () {
                                  // Hiển thị popup nhập tin nhắn và danh sách tin nhắn
                                  showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      TextEditingController messageController = TextEditingController();
                                      return StatefulBuilder(
                                        builder: (context, setStateDialog) {
                                          if (!openSocket) {
                                            _openWebSocketConnection(
                                                int.parse(_bookingId), setStateDialog: setStateDialog);
                                          }
                                          return AlertDialog(
                                            title: const Text('Nhắn tin tài xế'),
                                            content: Container(
                                              width: double.maxFinite,
                                              child: Column(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Expanded(
                                                    child: StreamBuilder(
                                                      stream: broadcastStream,
                                                      builder: (context, snapshot) {
                                                        if (snapshot.hasData) {
                                                          try {
                                                            Map<String, dynamic> messageData = jsonDecode(
                                                                snapshot.data.toString());
                                                            String mess = messageData['message'] ?? '';
                                                            messages.add(ChatMessage(message: mess));
                                                          } catch (e) {
                                                            print('Error decoding message: $e');
                                                          }
                                                          return ListView.builder(
                                                            itemCount: messages.length,
                                                            itemBuilder: (context, index) {
                                                              ChatMessage chatMessage = messages[index];
                                                              return ListTile(
                                                                title: Text(chatMessage.message),
                                                              );
                                                            },
                                                          );
                                                        } else {
                                                          return const Center(
                                                            child: Text(
                                                              'Chưa có tin nhắn',
                                                              style: TextStyle(fontSize: 16, color: Colors.grey),
                                                            ),
                                                          );
                                                        }
                                                      },
                                                    ),
                                                  ),
                                                  TextField(
                                                    controller: messageController,
                                                    decoration: const InputDecoration(
                                                      hintText: 'Nhập tin nhắn...',
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            actions: [
                                              TextButton(
                                                onPressed: () {
                                                  Navigator.of(context).pop();
                                                },
                                                child: const Text('Hủy'),
                                              ),
                                              TextButton(
                                                onPressed: () {
                                                  final message = messageController.text;
                                                  if (message.isNotEmpty) {
                                                    sendMessage(int.parse(_bookingId), message);
                                                    messageController.clear();
                                                    setStateDialog(() {
                                                      messages.add(ChatMessage(message: message));
                                                    });
                                                  }
                                                },
                                                child: const Text('Gửi'),
                                              ),
                                            ],
                                          );
                                        },
                                      );
                                    },
                                  );
                                },
                                icon: const Icon(Icons.message, color: whiteColor), // Icon cho nút "Message"
                                label: const Text(
                                  'Message Driver',
                                  style: TextStyle(
                                    color: whiteColor,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: blueColor,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10), // Khoảng cách giữa hai phần nút

                          // Nút "Complete" ở dưới cùng
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return AlertDialog(
                                      backgroundColor: whiteColor,
                                      title: const Text(
                                        'Confirm Completion',
                                        style: TextStyle(
                                            fontSize: 22,
                                            fontWeight: FontWeight.bold,
                                            color: blackColor),
                                      ),
                                      content: const Text(
                                        'Are you sure you want to mark the emergency as completed?',
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: blackColor),
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(15),
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () {
                                            Navigator.of(context).pop();
                                          },
                                          child: const Text(
                                            'Cancel',
                                            style: TextStyle(
                                                color: primaryColor,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16),
                                          ),
                                        ),
                                        TextButton(
                                          onPressed: () {
                                            if (bookingId1 != null) {
                                              _upDateBookingStatus(bookingId1);
                                            } else {
                                              try {
                                                _upDateBookingStatus(int.parse(_bookingId));
                                              } catch (e) {
                                                print('Error converting _bookingId to int: $e');
                                              }
                                            }
                                            Navigator.of(context).pop();
                                          },
                                          child: const Text(
                                            'Confirm',
                                            style: TextStyle(
                                                color: primaryColor,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16),
                                          ),
                                        ),
                                      ],
                                    );
                                  },
                                );
                              },
                              icon: const Icon(Icons.check_circle, color: whiteColor), // Icon cho nút "Complete"
                              label: const Text(
                                'Complete',
                                style: TextStyle(
                                  color: whiteColor,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: primaryColor,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8.0),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              )
            : Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: ListView(
                    children: <Widget>[
                      const SizedBox(
                        height: 20,
                      ),
                      const Center(
                        child: Text(
                          'Emergency Booking',
                          style: TextStyle(
                              color: primaryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 22),
                        ),
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                      SizedBox(
                        width: double.infinity,
                        child: TextFormField(
                          onChanged: (value) {
                            setState(() {
                              patientName =
                                  value; // Lưu giá trị ngay khi người dùng nhập
                            });
                            print('Updated patientName: $patientName');
                          },
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
                              borderSide:
                                  BorderSide(color: Colors.black54, width: 1.0),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderSide:
                                  BorderSide(color: Colors.black54, width: 1.0),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.red,
                                width: 1.0,
                              ),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            focusedErrorBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.red,
                                width: 1.0,
                              ),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
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
                          keyboardType: TextInputType.emailAddress,
                          onChanged: (value) {
                            setState(() {
                              email =
                                  value; // Lưu giá trị ngay khi người dùng nhập
                            });
                            print('Updated email: $email');
                          },
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
                              borderSide:
                                  BorderSide(color: Colors.black54, width: 1.0),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderSide:
                                  BorderSide(color: Colors.black54, width: 1.0),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.red,
                                width: 1.0,
                              ),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            focusedErrorBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.red,
                                width: 1.0,
                              ),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
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
                            if (!RegExp(r'^[^@]+@[^@]+\.[^@]+')
                                .hasMatch(value)) {
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
                          keyboardType: TextInputType.phone,
                          onChanged: (value) {
                            setState(() {
                              phoneNumber =
                                  value; // Lưu giá trị ngay khi người dùng nhập
                            });
                            print('Updated phoneNumber: $phoneNumber');
                          },
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
                              borderSide:
                                  BorderSide(color: Colors.black54, width: 1.0),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderSide:
                                  BorderSide(color: Colors.black54, width: 1.0),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.red,
                                width: 1.0,
                              ),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            focusedErrorBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: Colors.red,
                                width: 1.0,
                              ),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
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
                      const SizedBox(
                        height: 20,
                      ),
                      SizedBox(
                        width: double.infinity,
                        child: DropdownButtonFormField<String>(
                          dropdownColor: whiteColor,
                          decoration: const InputDecoration(
                            prefixIcon: Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8.0),
                              child: Icon(
                                Icons.car_crash,
                                color: Colors.black54,
                              ),
                            ),
                            hintText: 'Type of ambulance',
                            focusedBorder: OutlineInputBorder(
                              borderSide:
                                  BorderSide(color: Colors.black54, width: 1.0),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderSide:
                                  BorderSide(color: Colors.black54, width: 1.0),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(15)),
                            ),
                          ),
                          value: ambulanceType,
                          items: ambulanceTypes.map((String type) {
                            return DropdownMenuItem<String>(
                              value: type,
                              child: Text(
                                type,
                                style: const TextStyle(
                                    color: blackColor,
                                    fontSize: 16.0,
                                    fontWeight: FontWeight.bold),
                              ),
                            );
                          }).toList(),
                          onChanged: (newValue) =>
                              setState(() => ambulanceType = newValue!),
                        ),
                      ),
                      const SizedBox(height: 20),
                      SwitchListTile(
                        title: const Text(
                          'Use current location for pickup point',
                          style: TextStyle(
                              color: blackColor,
                              fontSize: 16,
                              fontWeight: FontWeight.bold),
                        ),
                        value: useCurrentLocation,
                        activeColor: whiteColor,
                        activeTrackColor: primaryColor,
                        inactiveThumbColor: whiteColor,
                        inactiveTrackColor: Colors.black54,
                        onChanged: (value) {
                          setState(() {
                            useCurrentLocation = value;
                            if (useCurrentLocation) {
                              // Bật sử dụng vị trí hiện tại
                              hospitalNameController.clear();
                              _startTrackingLocation();
                            } else {
                              // Khi tắt công tắc, cho phép chọn vị trí từ danh sách gợi ý
                              updateLocation = true;
                              _hospitalLocation = null;
                              _currentLocation =
                                  null; // Đặt lại vị trí hiện tại
                            }
                          });
                        },
                      ),
                      SwitchListTile(
                        title: const Text(
                            'Select a location on the map for your destination',
                            style: TextStyle(
                                color: blackColor,
                                fontSize: 16,
                                fontWeight: FontWeight.bold)),
                        value: useMapForDestination,
                        activeColor: whiteColor,
                        activeTrackColor: primaryColor,
                        inactiveThumbColor: whiteColor,
                        inactiveTrackColor: Colors.black54,
                        onChanged: (value) {
                          setState(() {
                            useMapForDestination = value;
                            if (useMapForDestination) {
                              destinationController.clear();
                            }
                          });
                        },
                      ),
                      if (!useCurrentLocation)
                        const SizedBox(
                          height: 20,
                        ),
                      if (!useCurrentLocation)
                        GestureDetector(
                          onTap: () {
                            _showHospitalSuggestions();
                          },
                          child: AbsorbPointer(
                            child: TextFormField(
                              style: const TextStyle(
                                  color: blackColor,
                                  fontSize: 16.0,
                                  fontWeight: FontWeight.bold),
                              controller: hospitalNameController,
                              decoration: const InputDecoration(
                                prefixIcon: Padding(
                                  padding:
                                      EdgeInsets.symmetric(horizontal: 8.0),
                                  child: Icon(
                                    Icons.location_on,
                                    color: Colors.black54,
                                  ),
                                ),
                                hintText: 'Select Pickup Point',
                                hintStyle: TextStyle(
                                    color: Colors.black54,
                                    fontSize: 16.0,
                                    fontWeight: FontWeight.bold),
                                focusedBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                      color: Colors.black54, width: 1.0),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(15)),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                      color: Colors.black54, width: 1.0),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(15)),
                                ),
                                errorBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Colors.red,
                                    width: 1.0,
                                  ),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(15)),
                                ),
                                focusedErrorBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Colors.red,
                                    width: 1.0,
                                  ),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(15)),
                                ),
                                errorStyle: TextStyle(
                                    color: Colors.red,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold),
                              ),
                              validator: (value) {
                                if (!useCurrentLocation &&
                                    (value == null || value.isEmpty)) {
                                  return 'Please select a hospital or use current location';
                                }
                                return null;
                              },
                            ),
                          ),
                        ),
                      if (!useMapForDestination)
                        const SizedBox(
                          height: 20,
                        ),
                      if (!useMapForDestination)
                        GestureDetector(
                          onTap: () {
                            _showHospitalSuggestions(isDestination: true);
                          },
                          child: AbsorbPointer(
                            child: TextFormField(
                              style: const TextStyle(
                                  color: blackColor,
                                  fontSize: 16.0,
                                  fontWeight: FontWeight.bold),
                              controller: destinationController,
                              decoration: const InputDecoration(
                                hintText: 'Select Destination',
                                prefixIcon: Padding(
                                  padding:
                                      EdgeInsets.symmetric(horizontal: 8.0),
                                  child: Icon(
                                    Icons.location_on,
                                    color: Colors.black54,
                                  ),
                                ),
                                hintStyle: TextStyle(
                                    color: Colors.black54,
                                    fontSize: 16.0,
                                    fontWeight: FontWeight.bold),
                                focusedBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                      color: Colors.black54, width: 1.0),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(15)),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                      color: Colors.black54, width: 1.0),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(15)),
                                ),
                                errorBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Colors.red,
                                    width: 1.0,
                                  ),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(15)),
                                ),
                                focusedErrorBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Colors.red,
                                    width: 1.0,
                                  ),
                                  borderRadius:
                                      BorderRadius.all(Radius.circular(15)),
                                ),
                                errorStyle: TextStyle(
                                    color: Colors.red,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please select destination';
                                }
                                return null;
                              },
                            ),
                          ),
                        ),
                      const SizedBox(
                        height: 20,
                      ),
                      SizedBox(
                        height: 200,
                        child: FlutterMap(
                          mapController: _mapController,
                          options: MapOptions(
                            center: _currentLocation ??
                                _hospitalLocation ??
                                LatLng(20.99167, 105.845),
                            zoom: _currentZoom,
                            onTap: (tapPosition, LatLng tappedPoint) {
                              if (useMapForDestination) {
                                setState(() {
                                  _destinationLocation = tappedPoint;
                                  _calculateCost(); // Tính toán chi phí sau khi chọn điểm đến
                                });
                              }
                            },
                          ),
                          children: [
                            TileLayer(
                              urlTemplate:
                                  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                              subdomains: ['a', 'b', 'c'],
                            ),
                            if (_currentLocation != null ||
                                _hospitalLocation != null ||
                                _destinationLocation != null)
                              MarkerLayer(
                                markers: [
                                  Marker(
                                    width: 80.0,
                                    height: 80.0,
                                    point: useCurrentLocation &&
                                            _currentLocation != null
                                        ? _currentLocation!
                                        : (_hospitalLocation ??
                                            LatLng(20.99167, 105.845)),
                                    builder: (ctx) => const Icon(
                                        Icons.location_pin,
                                        color: primaryColor,
                                        size: 40.0),
                                  ),
                                  if (_destinationLocation != null)
                                    Marker(
                                      width: 80.0,
                                      height: 80.0,
                                      point: _destinationLocation!,
                                      builder: (ctx) => const Icon(Icons.flag,
                                          color: Colors.green, size: 40.0),
                                    ),
                                ],
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: whiteColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                            side: const BorderSide(
                              color: primaryColor,
                              width: 0.5,
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 15),
                          ),
                          onPressed: _calculateCost,
                          child: const Text(
                            'Calculate Estimated Cost',
                            style: TextStyle(
                                color: primaryColor,
                                fontSize: 16.0,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 15),
                          ),
                          onPressed: () {
                            if (_formKey.currentState?.validate() ?? false) {
                              _submitForm();
                            }
                          },
                          child: const Text(
                            'Book Now',
                            style: TextStyle(
                                color: whiteColor,
                                fontSize: 16.0,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
      ),
      if (isLoading)
        Positioned.fill(
          child: Container(
            color: blackColor.withOpacity(0.5),
            child: const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(whiteColor),
              ),
            ),
          ),
        ),
    ]);
  }
}
