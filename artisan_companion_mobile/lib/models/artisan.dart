class Artisan {
  final String artisanId;
  final String name;
  final String craftType;
  final String region;
  final String dialect;
  final String skillLevel;
  final double hourlyRate;
  final String? pmVishwakarmaId;

  Artisan({
    required this.artisanId,
    required this.name,
    required this.craftType,
    required this.region,
    this.dialect = 'hi-IN',
    this.skillLevel = 'Master Artisan',
    this.hourlyRate = 140.0,
    this.pmVishwakarmaId,
  });

  factory Artisan.fromJson(Map<String, dynamic> json) {
    return Artisan(
      artisanId: json['artisan_id'] ?? '',
      name: json['name'] ?? '',
      craftType: json['craft_type'] ?? '',
      region: json['region'] ?? '',
      dialect: json['dialect'] ?? 'hi-IN',
      skillLevel: json['skill_level'] ?? 'Master Artisan',
      hourlyRate: (json['hourly_rate'] as num?)?.toDouble() ?? 140.0,
      pmVishwakarmaId: json['pm_vishwakarma_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'artisan_id': artisanId,
      'name': name,
      'craft_type': craftType,
      'region': region,
      'dialect': dialect,
      'skill_level': skillLevel,
      'hourly_rate': hourlyRate,
      'pm_vishwakarma_id': pmVishwakarmaId,
    };
  }
}
