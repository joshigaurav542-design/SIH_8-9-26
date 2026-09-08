import 'package:flutter/material.dart';

class VisionScannerScreen extends StatefulWidget {
  final Function(Map<String, dynamic>)? onScanComplete;

  const VisionScannerScreen({super.key, this.onScanComplete});

  @override
  State<VisionScannerScreen> createState() => _VisionScannerScreenState();
}

class _VisionScannerScreenState extends State<VisionScannerScreen> with SingleTickerProviderStateMixin {
  bool _isScanning = false;
  late AnimationController _laserController;

  final Map<String, dynamic> _craft = {
    'name': 'Gorakhpur GI Terracotta Urn',
    'category': 'Pottery & Terracotta',
    'dimensions': '32cm (H) x 20cm (W)',
    'weight': '1,200g',
    'symmetry': 96.4,
    'density': 94.1,
    'trustBadge': 'Masterpiece Grade A+ (GI Certified)',
    'image': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  };

  @override
  void initState() {
    super.initState();
    _laserController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _laserController.dispose();
    super.dispose();
  }

  Future<void> _triggerScan() async {
    setState(() => _isScanning = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() => _isScanning = false);
    }
    if (widget.onScanComplete != null) {
      widget.onScanComplete!(_craft);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Step Header
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: const BoxDecoration(
                  color: Color(0xFFE05638),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Text('2', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 8),
              const Text(
                'Edge AI Vision Scanner',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.amber.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.amber.withOpacity(0.4)),
                ),
                child: const Text('TF-Lite Edge', style: TextStyle(color: Colors.amberAccent, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'On-device object recognition extracts dimensions and evaluates craft symmetry in zero-internet zones.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
          ),
          const SizedBox(height: 16),

          // Viewfinder Container
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Container(
              height: 240,
              decoration: BoxDecoration(
                color: Colors.black,
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    _craft['image'],
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: const Color(0xFF131B2E),
                      child: const Center(
                        child: Icon(Icons.broken_image, color: Colors.grey, size: 40),
                      ),
                    ),
                  ),

                  // Bounding Box Overlay
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFF39C12), width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Stack(
                        children: [
                          Positioned(
                            top: 8,
                            left: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              color: Colors.black.withOpacity(0.7),
                              child: Text(
                                'YOLOv8: ${_craft['category']} (99.1%)',
                                style: const TextStyle(color: Color(0xFFF39C12), fontSize: 10, fontFamily: 'monospace'),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 8,
                            right: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              color: Colors.black.withOpacity(0.7),
                              child: Text(
                                'DIM: ${_craft['dimensions']}',
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontFamily: 'monospace'),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Laser sweep animation
                  if (_isScanning)
                    AnimatedBuilder(
                      animation: _laserController,
                      builder: (context, child) {
                        return Positioned(
                          top: _laserController.value * 230,
                          left: 0,
                          right: 0,
                          child: Container(
                            height: 3,
                            decoration: const BoxDecoration(
                              boxShadow: [
                                BoxShadow(color: Color(0xFFF39C12), blurRadius: 10, spreadRadius: 2),
                              ],
                              gradient: LinearGradient(
                                colors: [Colors.transparent, Color(0xFFF39C12), Color(0xFFE05638), Colors.transparent],
                              ),
                            ),
                          ),
                        );
                      },
                    ),

                  // Bottom Trigger Button
                  Positioned(
                    bottom: 12,
                    left: 16,
                    child: ElevatedButton.icon(
                      onPressed: _isScanning ? null : _triggerScan,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE05638),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: Icon(_isScanning ? Icons.refresh : Icons.camera_alt, size: 16),
                      label: Text(
                        _isScanning ? 'Analyzing...' : 'Re-Scan Craft',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Quality Metrics Tiles
          Row(
            children: [
              Expanded(
                child: _QualityMetricTile(
                  title: 'Bilateral Symmetry',
                  score: '${_craft['symmetry']}%',
                  subtitle: 'Rotational Balance',
                  progressColor: const Color(0xFFF39C12),
                  progressValue: _craft['symmetry'] / 100,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _QualityMetricTile(
                  title: 'Weave Density',
                  score: '${_craft['density']}%',
                  subtitle: 'Authentic Handcraft',
                  progressColor: Colors.greenAccent,
                  progressValue: _craft['density'] / 100,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Trust Badge Card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.amber.shade900.withOpacity(0.3), Colors.black.withOpacity(0.4)],
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.workspace_premium, color: Color(0xFFD4AF37), size: 28),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'TRUST BADGE ISSUED',
                        style: TextStyle(color: Color(0xFFD4AF37), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _craft['trustBadge'],
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QualityMetricTile extends StatelessWidget {
  final String title;
  final String score;
  final String subtitle;
  final Color progressColor;
  final double progressValue;

  const _QualityMetricTile({
    required this.title,
    required this.score,
    required this.subtitle,
    required this.progressColor,
    required this.progressValue,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF131B2E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: Colors.grey, fontSize: 11)),
              Text(score, style: TextStyle(color: progressColor, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: progressValue,
              backgroundColor: Colors.white.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(progressColor),
              minHeight: 4,
            ),
          ),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 9)),
        ],
      ),
    );
  }
}
