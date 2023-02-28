const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      aspectRatio: {
        'A4': '1 / 1.414'
      }
    },
  },

  plugins: [],
};

module.exports = config;
