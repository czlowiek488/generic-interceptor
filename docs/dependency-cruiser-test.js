module.exports = {
    options: {
      includeOnly: "tests",
      exclude: "node_modules",
      prefix: "https://github.com/czlowiek488/generic-interceptor/blob/master/",
      tsPreCompilationDeps: false,
      tsConfig: { fileName: "./tsconfig.json" },
      progress: { type: "performance-log" },
      reporterOptions: {
        dot: {
          showMetrics: true,
          theme: {
            modules: [
              {
                criteria: { source: "tests/case" },
                attributes: { fillcolor: "#c79cbc" },
              },
              {
                criteria: { source: "tests/common" },
                attributes: { fillcolor: "#c79cbc" },
              },
              {
                criteria: { source: "tests/shared" },
                attributes: { fillcolor: "#c8e0c2" },
              },
            ],
          },
        },
      },
    },
  };