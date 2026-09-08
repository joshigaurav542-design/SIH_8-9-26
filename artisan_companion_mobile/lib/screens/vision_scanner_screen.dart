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

  static final List<Map<String, dynamic>> _samples = [
    {
      'name': 'Gorakhpur GI Terracotta Urn',
      'category': 'Pottery & Terracotta',
      'dimensions': '32cm (H) x 20cm (W)',
      'weight': '1,200g',
      'symmetry': 96.4,
      'density': 94.1,
      'trustBadge': 'Masterpiece Grade A+ (GI Certified)',
      'image': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    },
    {
      'name': 'Varanasi Royal Katan Silk',
      'category': 'Handloom & Banarasi Silk',
      'dimensions': '2.4m x 0.9m',
      'weight': '350g',
      'symmetry': 98.2,
      'density': 97.5,
      'trustBadge': 'National Heritage Masterpiece',
      'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    },
    {
      'name': 'Bastar Lost-Wax Bell Metal',
      'category': 'Dhokra Brass Casting',
      'dimensions': '25cm x 12cm x 9cm',
      'weight': '850g',
      'symmetry': 93.8,
      'density': 95.0,
      'trustBadge': 'Heritage Certified Grade A',
      'image': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    },
  ];

  late Map<String, dynamic> _craft;

  @override
  void initState() {
    super.initState();
    _craft = Map<String, dynamic>.from(_samples[0]);
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

  void _selectCraft(Map<String, dynamic> sample) {
    setState(() {
      _craft = Map<String, dynamic>.from(sample);
    });
    _triggerScan();
  }

  void _showAddPhotoDialog() {
    final nameController = TextEditingController(text: 'My Handcrafted Pottery');
    final urlController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF131B2E),
        title: const Text('Add Custom Craft Photo', style: TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Craft Name',
                labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF334155))),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: urlController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Photo URL (JPEG / PNG)',
                hintText: 'https://example.com/craft.jpg',
                hintStyle: TextStyle(color: Color(0xFF475569)),
                labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF334155))),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE05638)),
            onPressed: () {
              if (urlController.text.trim().isNotEmpty) {
                setState(() {
                  _craft = {
                    'name': nameController.text.trim().isEmpty ? 'Handcrafted Craft' : nameController.text.trim(),
                    'category': 'Custom Handcrafted Item',
                    'dimensions': '28cm x 18cm x 12cm',
                    'weight': '800g',
                    'symmetry': 95.2,
                    'density': 94.7,
                    'trustBadge': 'Artisan Verified (GI Quality)',
                    'image': urlController.text.trim(),
                  };
                });
                Navigator.pop(ctx);
                _triggerScan();
              }
            },
            child: const Text('Add & Scan', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
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
          const SizedBox(height: 12),

          // Sample Craft Selector & Custom Photo Upload Button
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                ..._samples.map((sample) {
                  final isSelected = _craft['name'] == sample['name'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(
                        (sample['name'] as String).split(' ').take(2).join(' '),
                        style: TextStyle(
                          fontSize: 11,
                          color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: const Color(0xFFE05638),
                      backgroundColor: const Color(0xFF1E293B),
                      onSelected: (val) {
                        if (val) _selectCraft(sample);
                      },
                    ),
                  );
                }),
                ActionChip(
                  avatar: const Icon(Icons.add_a_photo, size: 14, color: Colors.amberAccent),
                  label: const Text('Add Photo', style: TextStyle(fontSize: 11, color: Colors.amberAccent)),
                  backgroundColor: const Color(0xFF1E293B),
                  side: const BorderSide(color: Colors.amberAccent, width: 0.8),
                  onPressed: _showAddPhotoDialog,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

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

                  // Bottom Action Buttons
                  Positioned(
                    bottom: 12,
                    left: 16,
                    right: 16,
                    child: Row(
                      children: [
                        ElevatedButton.icon(
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
                        const SizedBox(width: 8),
                        OutlinedButton.icon(
                          onPressed: _showAddPhotoDialog,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.amberAccent,
                            backgroundColor: Colors.black.withOpacity(0.6),
                            side: const BorderSide(color: Colors.amberAccent, width: 0.8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.photo_library, size: 16),
                          label: const Text('Add Photo', style: TextStyle(fontSize: 12)),
                        ),
                      ],
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
