define(function(require, exports, module) {
    "use strict";

    main.consumes = [
        "c9", "menus", "Plugin", "proc", "tree", "ui"
    ];

    main.provides = ["harvard.cs50.server"];
    return main;

    function main(options, imports, register) {
        const c9 = imports.c9;
        const menus = imports.menus;
        const Plugin = imports.Plugin;
        const proc = imports.proc;
        const tree = imports.tree;
        const ui = imports.ui;

        const plugin = new Plugin("CS50", main.consumes);

        function addWebServer() {
            menus.addItemByPath("AWS Cloud9/Web Server", new ui.item({
                id: "web_server",
                caption: "Web Server",
                onclick() {
                    if (c9.hostname)
                        window.open(`http://${c9.hostname}`);
                    else
                        console.error("hostname is not set");
                }
            }), 102, plugin);
        }


        function addServe() {
            tree.getElement("mnuCtxTree", mnuCtxTree => {

                // add "Serve" to tree context menu
                menus.addItemToMenu(mnuCtxTree, new ui.item({
                    caption: "Serve",
                    match: "folder",

                    // disable "Serve"
                    isAvailable() {

                        // disable item when more than one folder is selected
                        return tree.selectedNodes.filter(node => {
                            return node.isFolder;
                        }).length === 1;
                    },
                    onclick() {
                        const node = tree.selectedNodes.find(node => {
                            return node.isFolder;
                        });

                        if (!node)
                            return;

                        // path for selected directory
                        const path = node.path.replace(/^\//, c9.environmentDir + "/");

                        // open new browser tab
                        const tab = window.open("", "_blank");
                        if (!tab)
                            return;

                        tab.document.write(
                            'Starting http-server...<br>' +
                            'Please wait! This page will reload automatically.'
                        );

                        // spawn http-server
                        // alias isn't seen by subshell
                        const PORT = "8081";
                        proc.spawn("http-server", {
                            args: [ "-p", PORT ],
                            cwd: path
                        },
                        (err, process) => {
                            if (err) {
                                // showError("Could not start http-server");
                                tab.document.write("Could not start http-server.");
                                return console.error(err);
                            }

                            process.stderr.on("data", chunk => {
                                console.log(chunk);
                            });

                            setTimeout(() => {
                                tab.location.href = `http://${c9.hostname}:${PORT}`;
                            },
                            1000);
                        });
                    }
                }), 102, plugin);
            });
        }

        let loaded = false;
        plugin.on("load", () => {
            if (loaded)
               return false;

            loaded = true;
            addServe();
            addWebServer();
        });

        plugin.on("unload", () => {});

        plugin.freezePublicAPI({});

        register(null, { "harvard.cs50.server" : plugin });
    }
});
