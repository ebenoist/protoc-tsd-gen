const { exec } = require('child_process');
const fs = require('fs');


describe('tsd generator', () => {
  it('creates a basic ts.d', () => {
    exec('protoc -I . --tsd_out=tmp/ ./msg.proto --plugin ./bin/protoc-gen-tsd', (err, stdout, stderr) => {
      expect(stderr).toBeNull();
      expect(err).toBeUndefined();
    });

    expect(fs.existsSync('tmp/msg.proto.d.ts')).toBeTruthy();
  });
});
