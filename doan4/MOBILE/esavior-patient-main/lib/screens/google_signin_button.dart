import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class GoogleSignInButton extends StatelessWidget {
  final Function(String, String) onLoginSuccess;

  const GoogleSignInButton({required this.onLoginSuccess, Key? key}) : super(key: key);

  Future<void> _handleSignIn(BuildContext context) async {
    final GoogleSignIn _googleSignIn = GoogleSignIn(
      scopes: ['email'],
    );

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser != null) {
        String randomPassword = _generateRandomPassword();
        final response = await http.post(
          Uri.parse('http://10.0.2.2:8081/api/v1/patients/google-login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'patient_name': googleUser.displayName ?? 'No name',
            'patient_email': googleUser.email,
            'patient_password': randomPassword,
          }),
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          String? patientId = data['patient_id']?.toString();
          String? patientName = data['patient_name'];

          // Kiểm tra nếu patient_id là null (tài khoản mới được tạo)
          if (patientId == null || patientId == 'null') {
            // Thử đăng nhập lại để lấy patient_id
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Tài khoản đã được tạo. Đang đăng nhập...')),
            );

            // Gọi lại API để lấy thông tin user vừa tạo
            await Future.delayed(Duration(milliseconds: 500)); // Đợi 500ms
            await _retryLogin(context, googleUser);
            return;
          }

          if (patientName != null) {
            int parsedPatientId = int.tryParse(patientId) ?? 0;
            if (parsedPatientId > 0) {
              SharedPreferences prefs = await SharedPreferences.getInstance();
              await prefs.setInt('patient_id', parsedPatientId);
              await prefs.setBool('isLoggedIn', true);

              onLoginSuccess(patientName, patientId);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Đăng nhập thành công qua Google\nTài khoản: ${googleUser.email}',
                  ),
                ),
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Patient ID không hợp lệ từ server')),
              );
            }
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Phản hồi không hợp lệ từ server')),
            );
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Đăng nhập thất bại, vui lòng thử lại.')),
          );
        }
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Đăng nhập thất bại: $error')),
      );
      print('Google sign-in error: $error');
    }
  }

  String _generateRandomPassword() {
    // Hàm này sẽ tạo một mật khẩu ngẫu nhiên
    return 'Password123@!'; // Thay bằng logic tạo mật khẩu ngẫu nhiên thực tế nếu cần
  }
  Future<void> _retryLogin(BuildContext context, GoogleSignInAccount googleUser) async {
    try {
      String randomPassword = _generateRandomPassword();
      final response = await http.post(
        Uri.parse('http://10.0.2.2:8081/api/v1/patients/google-login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'patient_name': googleUser.displayName ?? 'No name',
          'patient_email': googleUser.email,
          'patient_password': randomPassword,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        String? patientId = data['patient_id']?.toString();
        String? patientName = data['patient_name'];

        if (patientId != null && patientId != 'null' && patientName != null) {
          int parsedPatientId = int.tryParse(patientId) ?? 0;
          if (parsedPatientId > 0) {
            SharedPreferences prefs = await SharedPreferences.getInstance();
            await prefs.setInt('patient_id', parsedPatientId);
            await prefs.setBool('isLoggedIn', true);

            onLoginSuccess(patientName, patientId);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Đăng nhập thành công qua Google\nTài khoản: ${googleUser.email}',
                ),
              ),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Patient ID không hợp lệ từ server')),
            );
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Không thể lấy thông tin tài khoản. Vui lòng thử lại.')),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Đăng nhập thất bại, vui lòng thử lại.')),
        );
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi khi thử đăng nhập lại: $error')),
      );
      print('Retry login error: $error');
    }
  }
  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () => _handleSignIn(context),
      icon: Image.asset(
        'assets/images/google_logo.png',
        height: 24.0,
        errorBuilder: (context, error, stackTrace) {
          // Fallback nếu hình ảnh không tải được
          return Icon(Icons.error, color: Colors.red);
        },
      ),
      label: Row(
        mainAxisSize: MainAxisSize.min, // Giới hạn kích thước theo nội dung
        children: [
          SizedBox(width: 8), // Khoảng cách giữa icon và text
          Expanded(
            child: Text(
              'Sign in with Google',
              textAlign: TextAlign.center, // Căn giữa text
              overflow: TextOverflow.ellipsis, // Xử lý tràn text
            ),
          ),
        ],
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        minimumSize: Size(double.infinity, 50), // Đảm bảo kích thước phù hợp
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8), // Điều chỉnh padding
      ),
    );
  }
}