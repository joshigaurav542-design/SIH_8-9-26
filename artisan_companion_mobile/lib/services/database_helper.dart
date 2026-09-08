import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/product.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('artisan_companion.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Products table
    await db.execute('''
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        craft_style TEXT,
        material TEXT,
        dimensions TEXT,
        weight_grams REAL,
        symmetry_score REAL,
        density_score REAL,
        trust_badge TEXT,
        raw_material_cost REAL,
        labor_hours REAL,
        fair_labor_cost REAL,
        suggested_price REAL,
        image_url TEXT,
        ondc_published INTEGER,
        whatsapp_sync INTEGER
      )
    ''');

    // Offline sync queue table
    await db.execute('''
      CREATE TABLE sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING'
      )
    ''');
  }

  // Insert product locally
  Future<int> insertProduct(Product product) async {
    final db = await database;
    return await db.insert('products', product.toJson());
  }

  // Fetch all local products
  Future<List<Product>> getProducts() async {
    final db = await database;
    final maps = await db.query('products', orderBy: 'id DESC');

    if (maps.isNotEmpty) {
      return maps.map((json) => Product.fromJson(json)).toList();
    } else {
      return [];
    }
  }

  // Enqueue offline action
  Future<int> enqueueSyncAction(String action, String payloadJson) async {
    final db = await database;
    return await db.insert('sync_queue', {
      'action': action,
      'payload': payloadJson,
      'created_at': DateTime.now().toIso8601String(),
      'status': 'PENDING',
    });
  }

  // Get pending queue items
  Future<List<Map<String, dynamic>>> getPendingSyncItems() async {
    final db = await database;
    return await db.query('sync_queue', where: 'status = ?', whereArgs: ['PENDING']);
  }

  // Mark items as synced
  Future<int> clearSyncedItems() async {
    final db = await database;
    return await db.delete('sync_queue');
  }
}
