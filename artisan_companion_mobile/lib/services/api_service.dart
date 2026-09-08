import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';

class ApiService {
  // Use 10.0.2.2 for Android Emulator, or localhost / LAN IP for real device
  static const String defaultBaseUrl = 'http://10.0.2.2:8000/api/v1';
  final String baseUrl;

  ApiService({this.baseUrl = defaultBaseUrl});

  // Health Check
  Future<bool> checkBackendHealth() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/health')).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // Step 1: Multilingual Voice Transcription & Attribute Extraction
  Future<Map<String, dynamic>> processVoicePrompt({
    required String language,
    String? sampleText,
    String? audioBase64,
  }) async {
    final url = Uri.parse('$baseUrl/voice/process');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'language': language,
        'sample_text': sampleText,
        'audio_base64': audioBase64,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Voice processing failed: ${response.body}');
    }
  }

  // Step 2: Edge AI Vision Scan & Quality Evaluation
  Future<Map<String, dynamic>> scanCraftProduct({
    String? categoryHint,
    String? imageBase64,
  }) async {
    final url = Uri.parse('$baseUrl/vision/scan');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'category_hint': categoryHint,
        'image_base64': imageBase64,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Vision scan failed: ${response.body}');
    }
  }

  // Step 3: Heritage Living Wage Pricing Calculation
  Future<Map<String, dynamic>> calculatePricing({
    required double rawMaterialCost,
    required double laborHours,
    String skillLevel = 'Master Artisan',
    double artisanMarginPercent = 20.0,
  }) async {
    final url = Uri.parse('$baseUrl/pricing/calculate');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'raw_material_cost': rawMaterialCost,
        'labor_hours': laborHours,
        'skill_level': skillLevel,
        'artisan_margin_percent': artisanMarginPercent,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Pricing calculation failed: ${response.body}');
    }
  }

  // Step 3b: Generative Craft Storytelling & Certificate
  Future<Map<String, dynamic>> generateStoryAndCertificate({
    required String productTitle,
    required String craftStyle,
    required String artisanName,
    required String region,
    required String materialsUsed,
  }) async {
    final url = Uri.parse('$baseUrl/story/generate');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'product_title': productTitle,
        'craft_style': craftStyle,
        'artisan_name': artisanName,
        'region': region,
        'materials_used': materialsUsed,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Certificate generation failed: ${response.body}');
    }
  }

  // Step 4: Publish to ONDC Beckn Protocol & WhatsApp
  Future<Map<String, dynamic>> publishToONDC(int productId) async {
    final url = Uri.parse('$baseUrl/ondc/publish');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'product_id': productId,
        'channel': 'ONDC_AND_WHATSAPP',
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('ONDC publishing failed: ${response.body}');
    }
  }

  // Batch Offline Sync to Cloud
  Future<Map<String, dynamic>> syncOfflineBatch({
    required String deviceId,
    required List<Map<String, dynamic>> pendingItems,
  }) async {
    final url = Uri.parse('$baseUrl/sync/batch');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'device_id': deviceId,
        'pending_items': pendingItems,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Batch sync failed: ${response.body}');
    }
  }
}
