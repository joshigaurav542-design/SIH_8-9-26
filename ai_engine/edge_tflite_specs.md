# Edge AI Model Specifications & On-Device Deployment

## 1. Overview
As outlined in **Slide 4 (Feasibility & Viability)** of the SIH 2026 Presentation:
> *"Lightweight TF-Lite models run smoothly on entry-level Android smartphones."*
> *"Edge AI execution for image cataloging that works reliably in zero-internet rural zones."*

This module specifies the quantization, pruning, and deployment architecture for on-device inference on ₹6,000–₹10,000 Android devices with 2GB–3GB RAM.

---

## 2. Model Architecture & Pipeline

### A. Object Detection & Bounding Box (YOLOv8-Nano Quantized)
- **Base Architecture**: Ultralytics YOLOv8n (3.2 Million parameters)
- **Quantization**: INT8 Post-Training Quantization (PTQ)
- **Model Size**:
  - FP32 PyTorch model: ~6.5 MB
  - INT8 Quantized `.tflite`: **~1.8 MB**
- **Inference Latency**:
  - MediaTek Helio G35 / Snapdragon 680: **42ms - 68ms** per frame
- **Classes**:
  1. `pottery_terracotta`
  2. `handloom_textile`
  3. `wood_carving`
  4. `metal_dhokra_bidri`
  5. `folk_art_painting`
  6. `stone_craft`
  7. `bamboo_cane`

### B. Structural Symmetry & Quality Rating (OpenCV + MobileNetV3-Small)
- **Input**: Extracted craft bounding box cropped and normalized to 224x224 RGB.
- **Processing**:
  1. **Contour Extraction**: Bilateral edge extraction along the vertical axis of rotational symmetry.
  2. **Texture Density (Gabor Wavelet Filter)**: Evaluates warp/weft density for handloom weaving or chisel regularity in wood/metal.
- **Output**:
  - Symmetry Index: `0.0 - 100.0%`
  - Trust Grade: `Masterpiece A+`, `Heritage Grade A`, `Standard Grade B`

### C. Voice-to-Text Speech Pipeline (Whisper-Tiny / BHASHINI Vernacular ASR)
- **Model**: OpenAI Whisper-Tiny INT8 / Bhashini Offline ASR Engine
- **Vocabulary**: Regional Indian language acoustics (Hindi, Bengali, Tamil, Telugu, Marathi)
- **Offline Storage**: Pre-packaged language acoustic footprint under 35 MB.

---

## 3. Quantization Python Script Template

```python
import tensorflow as tf

def convert_to_edge_tflite(saved_model_dir: str, output_path: str):
    converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.int8]
    
    tflite_quant_model = converter.convert()
    with open(output_path, "wb") as f:
        f.write(tflite_quant_model)
    print(f"Quantized Edge Model successfully saved to: {output_path}")
```
