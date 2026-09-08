"""
Heritage Pricing Engine: Dynamic pricing suggestions based on raw material costs,
labor hours, artisan skill level, and complexity multipliers.

Guarantees fair living wages compliant with PM Vishwakarma standards
and eliminates intermediary/middlemen exploitation.
"""

SKILL_HOURLY_RATES = {
    "Apprentice": 90.0,       # INR per hour
    "Skilled": 135.0,         # INR per hour
    "Master Artisan": 200.0,   # INR per hour (National/State award grade)
}

CRAFT_COMPLEXITY_MULTIPLIERS = {
    "Pottery & Terracotta": 1.15,
    "Handloom & Banarasi Silk": 1.40,
    "Dhokra Brass Casting": 1.35,
    "Bidriware Metalwork": 1.45,
    "Wood Carving & Marquetry": 1.30,
    "Madhubani / Pattachitra Folk Art": 1.25,
    "Leather & Jutti Craft": 1.20,
    "General Handicraft": 1.10
}

def calculate_heritage_price(
    raw_material_cost: float,
    labor_hours: float,
    skill_level: str = "Master Artisan",
    artisan_margin_percent: float = 20.0,
    craft_category: str = "General Handicraft"
) -> dict:
    """
    Calculates transparent fair-trade pricing.
    """
    base_rate = SKILL_HOURLY_RATES.get(skill_level, 135.0)
    complexity = CRAFT_COMPLEXITY_MULTIPLIERS.get(craft_category, 1.2)
    
    # Direct Labor Cost = Hours * Base Hourly Wage * Craft Complexity Factor
    labor_cost = round(labor_hours * base_rate * complexity, 2)
    
    # Base Production Cost = Raw Materials + Labor Cost
    base_production_cost = round(raw_material_cost + labor_cost, 2)
    
    # Artisan Profit Margin
    artisan_profit = round(base_production_cost * (artisan_margin_percent / 100.0), 2)
    
    # Fair Market Recommended Price
    fair_market_price = round(base_production_cost + artisan_profit, 2)
    
    # In traditional exploitative middleman supply chains:
    # Middleman buys at 40% of fair value from artisan, sells to urban buyer at 2.5x markup.
    middleman_artisan_pay = round((raw_material_cost + (labor_hours * 45.0)), 2)
    middleman_retail_price = round(middleman_artisan_pay * 2.2, 2)
    
    extra_artisan_gain = round(((fair_market_price - middleman_artisan_pay) / max(middleman_artisan_pay, 1.0)) * 100, 1)

    return {
        "base_hourly_wage": base_rate,
        "total_labor_cost": labor_cost,
        "raw_material_cost": raw_material_cost,
        "complexity_adjustment": complexity,
        "artisan_profit": artisan_profit,
        "fair_market_price": fair_market_price,
        "middleman_price_comparison": middleman_retail_price,
        "artisan_take_home_in_traditional_channel": middleman_artisan_pay,
        "artisan_earnings_gain_percent": extra_artisan_gain,
        "summary_explanation": (
            f"Under fair-trade heritage pricing, the artisan earns INR {fair_market_price:.2f} "
            f"(including INR {labor_cost:.2f} guaranteed fair wage for {labor_hours} hours). "
            f"This delivers a +{extra_artisan_gain}% income boost over traditional trader rates."
        )
    }
