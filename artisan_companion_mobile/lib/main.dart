import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ArtisanCompanionApp());
}

class ArtisanCompanionApp extends StatelessWidget {
  const ArtisanCompanionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Artisan Companion (SIH26090)',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE05638), // Terracotta
          secondary: Color(0xFFF39C12), // Saffron
          surface: Color(0xFF131B2E), // Deep slate surface
        ),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
