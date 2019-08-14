define(function(require, exports, module) {
    "use strict";

    main.consumes = [
        "commands", "Plugin", "notificationBubble"
    ];

    main.provides = ["harvard.cs50.checkresults"];
    return main;

    function main(options, imports, register) {
        const commands = imports.commands;
        const bubble = imports.notificationBubble;
        const Plugin = imports.Plugin;
        const plugin = new Plugin("CS50", main.consumes);

        let loaded = false;
        plugin.on("load", () => {
            if (loaded)
               return false;

            loaded = true;
            commands.addCommand({
                name: "renderresults",
                hint: "Render check results",
                group: "General",
                exec: (args) => {
                    if (args.length !== 3 || typeof args[1] !== "string" || typeof args[2] !== "string")
                        return false;

                    bubble.popup(
                        [
                            ["span", "Click "],
                            [
                                "a",
                                {
                                    href:`javascript:(() => window.open('', '_blank').document.write('${args[2].replace(/'/g, "\\'")}'))()`,
                                    "style": "display: inline"
                                },
                                "here"
                            ],
                            [
                                "span",
                                ` to view detailed ${args[1]} results!`
                            ]
                            // `<span>Click <button onclick="()=>{ window.open('', '_blank').document.write('${args[2]}') }">here</button> to view detailed ${args[1]}  results!</span>`
                        ]
                    )
                }
            }, plugin);

        });

        plugin.on("unload", () => {});
        plugin.freezePublicAPI({});
        register(null, { "harvard.cs50.checkresults" : plugin });
    }
});
