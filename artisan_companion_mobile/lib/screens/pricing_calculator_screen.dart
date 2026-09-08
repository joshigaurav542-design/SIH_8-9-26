import 'package:flutter/material.dart';

class PricingCalculatorScreen extends StatefulWidget {
  final double initialCost;
  final double initialHours;

  const PricingCalculatorScreen({
    super.key,
    this.initialCost = 160.0,
    this.initialHours = 9.0,
  });

  @override
  State<PricingCalculatorScreen> createState() => _PricingCalculatorScreenState();
}

class _PricingCalculatorScreenState extends State<PricingCalculatorScreen> {
  late double _rawCost;
  late double _laborHours;
  String _skillTier = 'Master Artisan';
  double _marginPercent = 20.0;

  final Map<String, double> _skillWageMap = {
    'Apprentice': 90.0,
    'Skilled': 135.0,
    'Master Artisan': 200.0,
  };

  @override
  void initState() {
    super.initState();
    _rawCost = widget.initialCost;
    _laborHours = widget.initialHours;
  }

  @override
  Widget build(BuildContext context) {
    final double hourlyWage = _skillWageMap[_skillTier] ?? 140.0;
    const double complexityFactor = 1.25;
    final double laborCost = _laborHours * hourlyWage * complexityFactor;
    final double baseCost = _rawCost + laborCost;
    final double profit = baseCost * (_marginPercent / 100);
    final double fairPrice = baseCost + profit;

    // Middleman trader traditional payout
    final double traderPayout = _rawCost + (_laborHours * 45.0);
    final double extraGainPercent = ((fairPrice - traderPayout) / traderPayout) * 100;

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
                child: const Text('3', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 8),
              const Text(
                'Heritage Living Wage Pricing',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green.withOpacity(0.4)),
                ),
                child: const Text('Zero Middlemen', style: TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Replaces middleman exploitation with transparent living wages compliant with PM Vishwakarma guidelines.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
          ),
          const SizedBox(height: 16),

          // Sliders Panel
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
                // Raw Material Cost Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Raw Material Cost:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Text('₹${_rawCost.round()}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                Slider(
                  value: _rawCost,
                  min: 50,
                  max: 1500,
                  divisions: 29,
                  activeColor: const Color(0xFFF39C12),
                  onChanged: (val) => setState(() => _rawCost = val),
                ),

                // Labor Hours Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Labor Hours Invested:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Text('${_laborHours.round()} hrs', style: const TextStyle(color: Color(0xFFF39C12), fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                Slider(
                  value: _laborHours,
                  min: 1,
                  max: 30,
                  divisions: 29,
                  activeColor: const Color(0xFFF39C12),
                  onChanged: (val) => setState(() => _laborHours = val),
                ),

                // Skill Tier Dropdown
                const SizedBox(height: 8),
                const Text('Artisan Skill Tier:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: _skillTier,
                      dropdownColor: const Color(0xFF131B2E),
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      onChanged: (val) {
                        if (val != null) setState(() => _skillTier = val);
                      },
                      items: const [
                        DropdownMenuItem(value: 'Apprentice', child: Text('Apprentice (प्रशिक्षु - ₹90/hr)')),
                        DropdownMenuItem(value: 'Skilled', child: Text('Skilled Artisan (कुशल - ₹135/hr)')),
                        DropdownMenuItem(value: 'Master Artisan', child: Text('Master Artisan (उस्ताद - ₹200/hr)')),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Total Fair Price Result Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF18233C), Color(0xFF0D1527)],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFF39C12).withOpacity(0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'FAIR LIVING WAGE PRICE BREAKDOWN',
                  style: TextStyle(color: Color(0xFFF39C12), fontSize: 10, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                _PricingRow(label: 'Raw Materials:', value: '₹${_rawCost.round()}'),
                _PricingRow(label: 'Guaranteed Labor (${_laborHours.round()} hrs):', value: '₹${laborCost.round()}', valueColor: const Color(0xFFF39C12)),
                _PricingRow(label: 'Artisan Margin (${_marginPercent.round()}%):', value: '₹${profit.round()}', valueColor: Colors.greenAccent),
                const Divider(color: Colors.white24, height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Recommended ONDC Price', style: TextStyle(color: Colors.grey, fontSize: 10)),
                        Text(
                          '₹${fairPrice.round()}',
                          style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '+${extraGainPercent.round()}%',
                            style: const TextStyle(color: Colors.greenAccent, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const Text('Income Boost', style: TextStyle(color: Colors.grey, fontSize: 9)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Middleman warning banner
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.amber.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: Colors.amberAccent, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Middlemen traditionally pay only ₹${traderPayout.round()} for this piece. Direct ONDC ensures 100% reaches the artisan.',
                          style: const TextStyle(color: Colors.amberAccent, fontSize: 10),
                        ),
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

class _PricingRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _PricingRow({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          Text(value, style: TextStyle(color: valueColor ?? Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
