class Product {
  final int? id;
  final String sku;
  final String title;
  final String description;
  final String category;
  final String craftStyle;
  final String material;
  final String dimensions;
  final double weightGrams;
  final double symmetryScore;
  final double densityScore;
  final String trustBadge;
  final double rawMaterialCost;
  final double laborHours;
  final double fairLaborCost;
  final double suggestedPrice;
  final String? imageUrl;
  final bool ondcPublished;
  final bool whatsappSync;

  Product({
    this.id,
    required this.sku,
    required this.title,
    required this.description,
    required this.category,
    required this.craftStyle,
    required this.material,
    required this.dimensions,
    this.weightGrams = 500.0,
    this.symmetryScore = 95.0,
    this.densityScore = 92.0,
    this.trustBadge = 'Heritage Certified',
    required this.rawMaterialCost,
    required this.laborHours,
    required this.fairLaborCost,
    required this.suggestedPrice,
    this.imageUrl,
    this.ondcPublished = false,
    this.whatsappSync = false,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      sku: json['sku'] ?? 'SKU-TEMP',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'Handicraft',
      craftStyle: json['craft_style'] ?? '',
      material: json['material'] ?? '',
      dimensions: json['dimensions'] ?? '',
      weightGrams: (json['weight_grams'] as num?)?.toDouble() ?? 500.0,
      symmetryScore: (json['symmetry_score'] as num?)?.toDouble() ?? 95.0,
      densityScore: (json['density_score'] as num?)?.toDouble() ?? 92.0,
      trustBadge: json['trust_badge'] ?? 'Heritage Certified',
      rawMaterialCost: (json['raw_material_cost'] as num?)?.toDouble() ?? 100.0,
      laborHours: (json['labor_hours'] as num?)?.toDouble() ?? 4.0,
      fairLaborCost: (json['fair_labor_cost'] as num?)?.toDouble() ?? 500.0,
      suggestedPrice: (json['suggested_price'] as num?)?.toDouble() ?? 800.0,
      imageUrl: json['image_url'],
      ondcPublished: json['ondc_published'] ?? false,
      whatsappSync: json['whatsapp_sync'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sku': sku,
      'title': title,
      'description': description,
      'category': category,
      'craft_style': craftStyle,
      'material': material,
      'dimensions': dimensions,
      'weight_grams': weightGrams,
      'symmetry_score': symmetryScore,
      'density_score': densityScore,
      'trust_badge': trustBadge,
      'raw_material_cost': rawMaterialCost,
      'labor_hours': laborHours,
      'fair_labor_cost': fairLaborCost,
      'suggested_price': suggestedPrice,
      'image_url': imageUrl,
      'ondc_published': ondcPublished ? 1 : 0,
      'whatsapp_sync': whatsappSync ? 1 : 0,
    };
  }
}
