import 'package:flutter/material.dart';

class ONDCDistributionScreen extends StatefulWidget {
  final bool isOnline;

  const ONDCDistributionScreen({super.key, required this.isOnline});

  @override
  State<ONDCDistributionScreen> createState() => _ONDCDistributionScreenState();
}

class _ONDCDistributionScreenState extends State<ONDCDistributionScreen> {
  bool _isPublishing = false;
  bool _isPublished = false;
  int _pendingLocalCount = 2;

  Future<void> _handlePublish() async {
    setState(() => _isPublishing = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isPublishing = false;
        _isPublished = true;
      });
    }
  }

  Future<void> _handleSyncQueue() async {
    if (!widget.isOnline) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot sync in Offline mode. Switch to Online mode first.')),
      );
      return;
    }

    setState(() => _isPublishing = true);
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() {
        _isPublishing = false;
        _pendingLocalCount = 0;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All local SQLite records synced to ONDC Cloud!')),
      );
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
                child: const Text('4', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 8),
              const Text(
                'ONDC Multi-Channel Sync',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.withOpacity(0.4)),
                ),
                child: const Text('Beckn Protocol', style: TextStyle(color: Colors.lightBlueAccent, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Direct national distribution across buyer apps (Paytm, Pincode, Mystore) and automated WhatsApp commerce.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
          ),
          const SizedBox(height: 16),

          // Publish Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF131B2E),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (!_isPublished) ...[
                  const Text(
                    'Ready to Publish to National Network',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.isOnline
                        ? 'Connected to ONDC Gateway. Catalog will broadcast to all network buyer applications.'
                        : 'Offline mode active: Listing will be safely stored in local SQLite and auto-synced.',
                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                  ),
                  const SizedBox(height: 14),
                  ElevatedButton.icon(
                    onPressed: _isPublishing ? null : _handlePublish,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE05638),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: Icon(_isPublishing ? Icons.refresh : Icons.send),
                    label: Text(_isPublishing ? 'Broadcasting to ONDC...' : 'Publish Catalog Now'),
                  ),
                ] else ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green.withOpacity(0.3)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.greenAccent, size: 20),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Published to ONDC Network & WhatsApp Storefront',
                            style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  const _ChannelRow(
                    icon: Icons.public,
                    title: 'ONDC Network',
                    status: 'LIVE',
                    desc: 'Discoverable on Paytm, Magicpin, Mystore',
                  ),
                  const SizedBox(height: 8),
                  const _ChannelRow(
                    icon: Icons.chat,
                    title: 'WhatsApp Commerce',
                    status: 'SYNCED',
                    desc: 'Direct UPI payments to artisan bank account',
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Offline SQLite Resiliency Card (Slide 4)
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
                        Icon(Icons.storage, color: Color(0xFFF39C12), size: 18),
                        SizedBox(width: 6),
                        Text(
                          'Local SQLite Offline Queue',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: _pendingLocalCount > 0 ? Colors.amber.withOpacity(0.2) : Colors.green.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '$_pendingLocalCount Pending',
                        style: TextStyle(
                          color: _pendingLocalCount > 0 ? Colors.amberAccent : Colors.greenAccent,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Guarantees zero data loss in remote handicraft clusters with patchy cellular connectivity.',
                  style: TextStyle(color: Colors.grey, fontSize: 11),
                ),
                const SizedBox(height: 12),
                if (_pendingLocalCount > 0)
                  OutlinedButton.icon(
                    onPressed: _handleSyncQueue,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFF39C12),
                      side: const BorderSide(color: Color(0xFFF39C12)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.cloud_upload, size: 16),
                    label: const Text('Flush & Sync Queue Now', style: TextStyle(fontSize: 12)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChannelRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String status;
  final String desc;

  const _ChannelRow({required this.icon, required this.title, required this.status, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white70, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    Text(status, style: const TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
                Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
