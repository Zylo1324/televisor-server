import test from "node:test";
import assert from "node:assert/strict";
import { CHANNELS } from "../api/_core.js";
import logoHandler from "../api/logo.js";

function responseRecorder() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
  };
}

test("logo endpoint serves a packaged PNG", async () => {
  const res = responseRecorder();
  await logoHandler({ url: "/api/logo?chno=65" }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["Content-Type"], "image/png");
  assert.ok(Buffer.isBuffer(res.body));
  assert.deepEqual([...res.body.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("every catalog channel has a packaged PNG logo", async () => {
  for (const channel of CHANNELS) {
    const res = responseRecorder();
    await logoHandler({ url: `/api/logo?chno=${channel.chno}` }, res);
    assert.equal(res.statusCode, 200, `missing logo for channel ${channel.chno}`);
    assert.equal(res.headers["Content-Type"], "image/png");
  }
});

test("logo endpoint rejects an unsafe channel number", async () => {
  const res = responseRecorder();
  await logoHandler({ url: "/api/logo?chno=../65" }, res);
  assert.equal(res.statusCode, 400);
});
