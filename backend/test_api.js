import mongoose from 'mongoose';
import { startServer } from './server.js';
import { SAMPLE_PRESETS } from './services/dataConstants.js';

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING MERN BACKEND API TEST SUITE');
  console.log('========================================\n');

  let server;
  try {
    server = await startServer(5055);
    const BASE = 'http://127.0.0.1:5055';

    // 1. Test /health
    console.log('--- 1. Testing GET /health ---');
    const rHealth = await fetch(`${BASE}/health`);
    console.log('Status:', rHealth.status);
    const healthJson = await rHealth.json();
    console.log('Runtime:', healthJson.runtime);
    console.log('Model loaded:', healthJson.model_loaded);
    console.log('MongoDB status:', healthJson.mongodb?.status);
    if (rHealth.status !== 200 || !healthJson.model_loaded) {
      throw new Error('Health check failed!');
    }

    // 2. Test /schema
    console.log('\n--- 2. Testing GET /schema ---');
    const rSchema = await fetch(`${BASE}/schema`);
    console.log('Status:', rSchema.status);
    const schemaJson = await rSchema.json();
    console.log('Total features:', schemaJson.total_features);
    if (schemaJson.total_features !== 41) {
      throw new Error(`Expected 41 features, got ${schemaJson.total_features}`);
    }

    // 3. Test /presets
    console.log('\n--- 3. Testing GET /presets ---');
    const rPresets = await fetch(`${BASE}/presets`);
    console.log('Status:', rPresets.status);
    const presetsJson = await rPresets.json();
    console.log('Presets count:', presetsJson.presets?.length);
    if (!presetsJson.presets || presetsJson.presets.length === 0) {
      throw new Error('Presets empty!');
    }

    // 4. Test /predict with Normal HTTP Traffic
    console.log('\n--- 4. Testing POST /predict with Normal HTTP Preset ---');
    const normalPreset = SAMPLE_PRESETS[0];
    const rPred1 = await fetch(`${BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: normalPreset.features })
    });
    console.log('Status:', rPred1.status);
    const pred1Json = await rPred1.json();
    console.log('Prediction:', pred1Json.prediction);
    console.log('Confidence:', pred1Json.confidence_percent, '%');
    console.log('Risk Verdict:', pred1Json.risk_assessment?.verdict);
    if (pred1Json.prediction !== 'Normal') {
      throw new Error(`Expected Normal, got ${pred1Json.prediction}`);
    }

    // 5. Test /predict with SYN Flood (Neptune)
    console.log('\n--- 5. Testing POST /predict with SYN Flood Attack Preset ---');
    const dosPreset = SAMPLE_PRESETS[2]; // Index 2 is Neptune SYN flood
    const rPred2 = await fetch(`${BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: dosPreset.features })
    });
    console.log('Status:', rPred2.status);
    const pred2Json = await rPred2.json();
    console.log('Prediction:', pred2Json.prediction);
    console.log('Confidence:', pred2Json.confidence_percent, '%');
    console.log('Risk Verdict:', pred2Json.risk_assessment?.verdict);
    if (pred2Json.prediction !== 'Intrusion') {
      throw new Error(`Expected Intrusion, got ${pred2Json.prediction}`);
    }

    // 6. Test /predict with Port Scan (Satan Probe)
    console.log('\n--- 6. Testing POST /predict with Port Scan Preset ---');
    const probePreset = SAMPLE_PRESETS[3]; // Index 3 is Satan Portscan
    const rPred3 = await fetch(`${BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: probePreset.features })
    });
    console.log('Status:', rPred3.status);
    const pred3Json = await rPred3.json();
    console.log('Prediction:', pred3Json.prediction);
    console.log('Confidence:', pred3Json.confidence_percent, '%');
    console.log('Risk Verdict:', pred3Json.risk_assessment?.verdict);
    if (pred3Json.prediction !== 'Intrusion') {
      throw new Error(`Expected Intrusion, got ${pred3Json.prediction}`);
    }

    // 7. Test /api/history
    console.log('\n--- 7. Testing GET /api/history ---');
    const rHist = await fetch(`${BASE}/api/history`);
    console.log('Status:', rHist.status);
    const histJson = await rHist.json();
    console.log('History logs recorded count:', histJson.history?.length);
    if (!histJson.history || histJson.history.length < 3) {
      throw new Error('History was not persisted from predictions!');
    }

    // 8. Test /api/blocked-ips
    console.log('\n--- 8. Testing GET & POST /api/blocked-ips ---');
    const rBlockAdd = await fetch(`${BASE}/api/blocked-ips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip: '198.51.100.99',
        reason: 'Automated Test Intrusion Quarantine'
      })
    });
    console.log('Add Blocked IP Status:', rBlockAdd.status);

    const rBlockList = await fetch(`${BASE}/api/blocked-ips`);
    const blockListJson = await rBlockList.json();
    console.log('Blocked IPs count:', blockListJson.blocked_ips?.length);

    // 9. Test /api/stats
    console.log('\n--- 9. Testing GET /api/stats ---');
    const rStats = await fetch(`${BASE}/api/stats`);
    console.log('Status:', rStats.status);
    const statsJson = await rStats.json();
    console.log('Total predictions:', statsJson.total_predictions);
    console.log('Intrusions detected:', statsJson.intrusions_detected);
    console.log('Normal traffic:', statsJson.normal_traffic);

    console.log('\n======================================================');
    console.log('🎉 ALL MERN API & MACHINE LEARNING TESTS PASSED 100%!');
    console.log('======================================================\n');

    await mongoose.disconnect();
    if (server) {
      server.close();
    }
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    await mongoose.disconnect();
    if (server) {
      server.close();
    }
    process.exit(1);
  }
}

runTests();
