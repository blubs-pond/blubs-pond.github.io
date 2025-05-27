{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
  ];

  env = {};

  idx = {
    extensions = [];

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "test"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
        flowchart = {
          command = ["npm" "run" "preview:flowchart"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    workspace = {
      onCreate = {
        "install-deps" = "npm install";
      };
      onStart = {
        "generate-flowcharts" = "npm run flowchart";
      };
    };
  };
}