// Stub of youtubei.js for YouYubeZ. Replace this file (and its sha256 in the
// manifests) with a CommonJS bundle of https://www.npmjs.com/package/youtubei.js
// when you host the extension. It is not affiliated with YouTube or Google.
module.exports = {
  Innertube: {
    create: async function () {
      return {
        getInfo: async function () { return null; }
      };
    }
  }
};
