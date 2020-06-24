// var template = require("babel-template"
module.exports = function (babel) {
  const { types: t } = babel;
  var importVisitor = {
    ImportDeclaration(path) {
      const importFrom = path.node.source.value;
      var s = [];
      if (importFrom === "react-icons/fa" || importFrom === "react-icons/sl") {
        path.node.specifiers.forEach((specifier) => {
          const iconName = specifier.imported.name;
          const localName = specifier.local.name;
          if (!this.imported) {
            s.push(
              t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier("GenIcon"),
                    t.identifier("GenIcon")
                  ),
                ],
                t.stringLiteral("react-icons/lib")
              )
            );
            // s.push(
            //   t.importDeclaration(
            //     [t.importDefaultSpecifier(t.identifier("codegen"))],
            //     t.stringLiteral("babel-plugin-codegen/macro")
            //   )
            // );
            this.imported = true;
          }
          // var content =
          //   `var icon = '` +
          //   iconName +
          //   `';\n` +
          //   "var icons = require('react-icons/fa/codegen.js');\n" +
          //   "console.log(icons[icon]);\n" +
          //   "module.exports = icons[icon];";
          var icons = require(importFrom + "/codegen.js");
          var icon = iconName;

          var c = babel.template.ast(icons[icon]);
          s = s.concat(...c);
        });
        path.replaceWithMultiple(s);
      }
    },
  };
  return {
    visitor: {
      Program(path) {
        path.traverse(importVisitor, { imported: false });
      },
    },
  };
};
