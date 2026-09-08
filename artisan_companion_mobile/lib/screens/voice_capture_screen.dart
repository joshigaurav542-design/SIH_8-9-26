import 'package:flutter/material.dart';

class VoiceCaptureScreen extends StatefulWidget {
  final String language;
  final Function(Map<String, dynamic>)? onDataExtracted;

  const VoiceCaptureScreen({
    super.key,
    required this.language,
    this.onDataExtracted,
  });

  @override
  State<VoiceCaptureScreen> createState() => _VoiceCaptureScreenState();
}

class _VoiceCaptureScreenState extends State<VoiceCaptureScreen> with SingleTickerProviderStateMixin {
  bool _isRecording = false;
  bool _isProcessing = false;
  String _transcript = '';
  Map<String, dynamic>? _extractedData;
  late AnimationController _animController;

  final Map<String, String> _samples = {
    'hi-IN': 'मैंने यह टेराकोटा का बड़ा फूलदान बनाया है। गंगा किनारे की चिकनी मिट्टी इस्तेमाल की है। बनाने में 8 घंटे लगे और 160 रुपया खर्च हुआ।',
    'en-IN': 'Handcrafted brass Dhokra bell-metal tribal figurine using lost-wax casting. Took 12 hours of filigree work and raw material cost of 320 rupees.',
    'bn-IN': 'আমি বাঁকুড়ার পোড়ামাটির ঘোড়া বানিয়েছি। বানাতে 10 ঘণ্টা সময় লেগেছে, কাঁচামালের খরচ 150 টাকা।',
    'ta-IN': 'நான் இந்த மதுரை சுங்கடி சேலையை கையால் நெய்துள்ளேன். நெசவு செய்ய 14 மணிநேரம் ஆனது மற்றும் மூலப்பொருள் 450 ரூபாய்.',
  };

  @override
  void initState() {
    super.initState();
    _transcript = _samples[widget.language] ?? _samples['hi-IN']!;
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  @override
  void didUpdateWidget(covariant VoiceCaptureScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.language != widget.language) {
      setState(() {
        _transcript = _samples[widget.language] ?? _samples['hi-IN']!;
        _extractedData = null;
      });
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _handleRecordingToggle() async {
    if (_isRecording) {
      setState(() => _isRecording = false);
      return;
    }

    setState(() {
      _isRecording = true;
      _isProcessing = true;
      _extractedData = null;
    });

    // Simulate speech-to-text inference
    await Future.delayed(const Duration(seconds: 2));

    final hoursMatch = RegExp(r'(\d+)\s*(hour|घंटे|ঘণ্টা|மணிநேரம்)', caseSensitive: false).firstMatch(_transcript);
    final costMatch = RegExp(r'(\d+)\s*(rupee|रुपया|টাকা|ரூபாய்)', caseSensitive: false).firstMatch(_transcript);

    final double hours = hoursMatch != null ? double.parse(hoursMatch.group(1)!) : 8.0;
    final double cost = costMatch != null ? double.parse(costMatch.group(1)!) : 160.0;

    final extracted = {
      'craft_style': widget.language == 'ta-IN' ? 'Madurai Handloom' : (widget.language == 'en-IN' ? 'Dhokra Brass' : 'Pottery & Terracotta'),
      'material': widget.language == 'ta-IN' ? 'Organic Cotton' : 'River Alluvial Clay',
      'labor_hours': hours,
      'raw_material_cost': cost,
      'confidence': '98.4%',
    };

    if (mounted) {
      setState(() {
        _isRecording = false;
        _isProcessing = false;
        _extractedData = extracted;
      });
    }

    if (widget.onDataExtracted != null) {
      widget.onDataExtracted!(extracted);
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
                child: const Text('1', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 8),
              const Text(
                'Multilingual Voice Input',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.indigo.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.indigo.withOpacity(0.4)),
                ),
                child: const Text('BHASHINI AI', style: TextStyle(color: Colors.indigoAccent, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Rural craftspeople can speak freely in their regional Indian mother tongue to create digital listings in seconds.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
          ),
          const SizedBox(height: 16),

          // Speech Prompt Container
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF131B2E),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.mic, color: Color(0xFFF39C12), size: 16),
                        SizedBox(width: 4),
                        Text('Dialect Audio Stream', style: TextStyle(color: Color(0xFFF39C12), fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Text(
                      '${widget.language} • 16kHz',
                      style: const TextStyle(color: Colors.grey, fontSize: 10, fontFamily: 'monospace'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  _transcript,
                  style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
                ),
                if (_isRecording) ...[
                  const SizedBox(height: 16),
                  AnimatedBuilder(
                    animation: _animController,
                    builder: (context, child) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(12, (index) {
                          final height = 10.0 + (30.0 * ((index % 4 + _animController.value) % 1.0));
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            width: 3,
                            height: height,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF39C12),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          );
                        }),
                      );
                    },
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Controls
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _isProcessing ? null : _handleRecordingToggle,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isRecording ? Colors.redAccent : const Color(0xFFE05638),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: Icon(_isRecording ? Icons.mic_off : Icons.mic),
                  label: Text(
                    _isRecording ? 'Listening (सुन रहे हैं)...' : 'Tap to Speak (बोलें)',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              OutlinedButton(
                onPressed: () {
                  setState(() {
                    _transcript = _samples[widget.language] ?? _samples['hi-IN']!;
                  });
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: BorderSide(color: Colors.white.withOpacity(0.2)),
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Preset'),
              ),
            ],
          ),

          // Extracted Metadata Display
          if (_extractedData != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.green.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.greenAccent, size: 16),
                      SizedBox(width: 6),
                      Text(
                        'Structured Attributes Extracted',
                        style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _AttributeTile(
                          label: 'Craft Style',
                          value: _extractedData!['craft_style'] ?? '',
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _AttributeTile(
                          label: 'Raw Material',
                          value: _extractedData!['material'] ?? '',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _AttributeTile(
                          label: 'Labor Hours',
                          value: '${_extractedData!['labor_hours']} hrs',
                          valueColor: const Color(0xFFF39C12),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _AttributeTile(
                          label: 'Material Cost',
                          value: '₹${_extractedData!['raw_material_cost']}',
                          valueColor: Colors.greenAccent,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _AttributeTile extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _AttributeTile({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
