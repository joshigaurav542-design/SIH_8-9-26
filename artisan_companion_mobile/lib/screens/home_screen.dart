import 'package:flutter/material.dart';
import '../widgets/app_header.dart';
import 'voice_capture_screen.dart';
import 'vision_scanner_screen.dart';
import 'pricing_calculator_screen.dart';
import 'ondc_distribution_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  String _selectedLanguage = 'hi-IN';
  bool _isOnline = true;

  double _currentRawCost = 160.0;
  double _currentLaborHours = 9.0;

  void _onVoiceDataExtracted(Map<String, dynamic> data) {
    setState(() {
      _currentRawCost = (data['raw_material_cost'] as num?)?.toDouble() ?? _currentRawCost;
      _currentLaborHours = (data['labor_hours'] as num?)?.toDouble() ?? _currentLaborHours;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      VoiceCaptureScreen(
        language: _selectedLanguage,
        onDataExtracted: _onVoiceDataExtracted,
      ),
      const VisionScannerScreen(),
      PricingCalculatorScreen(
        initialCost: _currentRawCost,
        initialHours: _currentLaborHours,
      ),
      ONDCDistributionScreen(isOnline: _isOnline),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: Column(
        children: [
          AppHeader(
            selectedLanguage: _selectedLanguage,
            onLanguageChanged: (lang) => setState(() => _selectedLanguage = lang),
            isOnline: _isOnline,
            onToggleOnline: () => setState(() => _isOnline = !_isOnline),
          ),
          Expanded(
            child: screens[_currentIndex],
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF131B2E),
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: Colors.transparent,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: const Color(0xFFF39C12),
          unselectedItemColor: Colors.grey,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.mic),
              label: 'Voice',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.camera_alt),
              label: 'Vision',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.currency_rupee),
              label: 'Pricing',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.storefront),
              label: 'ONDC Sync',
            ),
          ],
        ),
      ),
    );
  }
}
