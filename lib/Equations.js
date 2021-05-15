var mathjs = require("mathjs");
// TODO: n-ary OperatorNode
// TODO: derivative of all mathjs functions

(function(exports) {
    const ConstantNode = mathjs.expression.node.ConstantNode;
    const SymbolNode = mathjs.expression.node.SymbolNode;
    const FunctionNode = mathjs.expression.node.FunctionNode;
    const OperatorNode = mathjs.expression.node.OperatorNode;
    const ParenthesisNode = mathjs.expression.node.ParenthesisNode;

    class Equations {
        constructor(options = {}) {
            this.symbolExprMap = {};
            this.exprSymbolMap = {};
            this.symbolTreeMap = {};
            this.symgen = 0;
            this.symbols = []; // preserve creation order
            this.simplify = options.simplify || this.fastSimplify;
            this.node0 = new ConstantNode(0);
            this.symbolTreeMap["0"] = this.node0;
            this.node1 = new ConstantNode(1);
            this.symbolTreeMap["1"] = this.node1;
            this.nodem1 = new ConstantNode(-1);
            this.symbolTreeMap["-1"] = this.nodem1;
            this.node2 = new ConstantNode(2);
            this.symbolTreeMap["2"] = this.node2;
        }

        generateSymbol() {
            return "_" + this.symgen++;
        }

        parameters() {
            var parms = {};
            var traverse = (node) => {
                if (node.isSymbolNode) {
                    if (this.symbolExprMap[node.name] == null && node.name[0] !== "_") {
                        parms[node.name] = true;
                    }
                } else if (node.isParenthesisNode) {
                    traverse(node.content);
                } else if (node.isFunctionNode || node.isOperatorNode) {
                    node.args.forEach((arg) => traverse(arg));
                }
            }
            Object.keys(this.symbolTreeMap).forEach((symbol) => traverse(this.symbolTreeMap[symbol]));
            return Object.keys(parms);
        }

        bindNode(symbol, node) {
            this.symbolTreeMap[symbol] = node;
            var expr = node.toString();
            this.symbolExprMap[expr] == null && (this.symbolExprMap[expr] = symbol);
            this.exprSymbolMap[symbol] = expr;
            this.symbols.push(symbol);
            return symbol;
        }

        fastSimplify(node) { // over 200x faster than mathjs.simplify
            if (node.isOperatorNode) {
                var a0 = this.fastSimplify(node.args[0]);
                var a1 = node.args[1] && this.fastSimplify(node.args[1]);
                if (node.op === "+") {
                    if (a0.isConstantNode) {
                        if (a0.value === "0") {
                            return a1;
                        } else if (a1.isConstantNode) {
                            return new ConstantNode(Number(a0.value) + Number(a1.value));
                        }
                    }
                    if (a1.isConstantNode && a1.value === "0") {
                        return a0;
                    }
                    return new OperatorNode(node.op, node.fn, [a0, a1]);
                } else if (node.op === "-") {
                    if (a0.isConstantNode && a1) {
                        if (a1.isConstantNode) {
                            return new ConstantNode(Number(a0.value) - Number(a1.value));
                        } else if (a0.value === "0") {
                            return new OperatorNode("-", "unaryMinus", [a1]);
                        }
                    }
                    if (node.fn === "subtract") {
                        if (a1.isConstantNode && a1.value === "0") {
                            return a0;
                        }
                        return new OperatorNode(node.op, node.fn, [a0, a1]);
                    } else if (node.fn === "unaryMinus") {
                        return new OperatorNode(node.op, node.fn, [a0]);
                    }
                } else if (node.op === "*") {
                    if (a0.isConstantNode) {
                        if (a0.value === "0") {
                            return this.node0;
                        } else if (a0.value === "1") {
                            return a1;
                        } else if (a1.isConstantNode) {
                            return new ConstantNode(Number(a0.value) * Number(a1.value));
                        }
                    }
                    if (a1.isConstantNode) {
                        if (a1.value === "0") {
                            return this.node0;
                        } else if (a1.value === "1") {
                            return a0;
                        } else if (a0.isOperatorNode && a0.op === node.op && a0.args[0].isConstantNode) {
                            var a00_a1 = new ConstantNode(Number(a0.args[0].value) * Number(a1.value));
                            return new OperatorNode(node.op, node.fn, [a00_a1, a0.args[1]]); // constants on left
                        }
                        return new OperatorNode(node.op, node.fn, [a1, a0]); // constants on left
                    }
                    return new OperatorNode(node.op, node.fn, [a0, a1]);
                } else if (node.op === "/") {
                    if (a0.isConstantNode) {
                        if (a0.value === "0") {
                            return this.node0;
                        } else if (a1.isConstantNode) {
                            return new ConstantNode(Number(a0.value) / Number(a1.value));
                        }
                    }
                    return new OperatorNode(node.op, node.fn, [a0, a1]);
                } else if (node.op === "^") {
                    if (a1.isConstantNode) {
                        if (a1.value === "0") {
                            return this.node1;
                        } else if (a1.value === "1") {
                            return a0;
                        } else if (a0.isConstantNode) { // fold constant
                            return new ConstantNode(
                                mathjs.pow(Number(a0.value), Number(a1.value)));
                        }
                    }
                    return new OperatorNode(node.op, node.fn, [a0, a1]);
                }
            } else if (node.isParenthesisNode) {
                var c = this.fastSimplify(node.content);
                if (c.isParenthesisNode || c.isSymbolNode || c.isConstantNode) {
                    return c;
                }
                return new ParenthesisNode(c);
            } else if (node.isFunctionNode) {
                var args = node.args.map((arg) => this.fastSimplify(arg));
                if (args.length === 1) {
                    if (args[0].isParenthesisNode) {
                        args[0] = args[0].content;
                    }
                }
                return new FunctionNode(node.name, args);
            }
            return node;
        }

        derivative(expr, variable = "x") {
            if (typeof variable !== "string") {
                throw new Error("derivative(expr, variable) requires a string variable");
            }
            if (expr instanceof Array) {
                return expr.map((e) => this.derivative(e, variable));
            }

            var exprTree = mathjs.parse(expr);
            var digestedSym = this.digestNode(exprTree);
            var dsymbol = digestedSym + "_d" + variable;
            var dexpr = this.exprSymbolMap[dsymbol];

            if (dexpr == null) {
                var node = this.symbolTreeMap[digestedSym];
                if (node == null) {
                    if (exprTree.isSymbolNode) {
                        return variable === expr ? "1" : "0";
                    }
                    throw new Error("Unknown symbol:" + digestedSym);
                }
                var dnode = this.nodeDerivative(node, variable);
                dnode = this.fastSimplify(dnode);
                dexpr = dnode.toString();
                var dexprSymbol = this.bindNormalizedExpr(dexpr, dsymbol);
                if (dexprSymbol !== dsymbol) {
                    // bind dsymbol  bindNode doesn't work here)
                    this.exprSymbolMap[dsymbol] = dexprSymbol;
                    this.symbols.push(dsymbol);
                    this.symbolTreeMap[dsymbol] = this.symbolNodeOfString(dexprSymbol);
                }
            }

            return dsymbol;
        }

        symbolNodeOfString(symbol) {
            if (symbol === "0") {
                return this.node0;
            } else if (symbol === "1") {
                return this.node1;
            }

            return new SymbolNode(symbol);
        }

        nodeDerivative(node, variable) {
            var dnode = null;
            var msg = "";
            if (node.isConstantNode) {
                dnode = this.node0;
            } else if (node.isSymbolNode) {
                if (node.name === variable) {
                    dnode = this.node1;
                } else if (this.exprSymbolMap[node.name]) {
                    var dname = this.derivative(node.name, variable);
                    dnode = this.symbolNodeOfString(dname);
                } else {
                    dnode = this.node0;
                }
            } else if (node.isParenthesisNode) {
                dnode = new ParenthesisNode(
                    this.nodeDerivative(node.content, variable));
            } else if (node.isOperatorNode) {
                var a0 = node.args[0];
                var a1 = node.args[1];
                var da0 = this.nodeDerivative(a0, variable);
                var da1 = a1 && this.nodeDerivative(a1, variable);
                msg = node.op;
                if (node.op === "+") {
                    if (node.args[0].isConstantNode) {
                        dnode = da1;
                    } else if (a1.isConstantNode) {
                        dnode = da0;
                    } else {
                        dnode = new OperatorNode(node.op, node.fn, [da0, da1]);
                    }
                } else if (node.op === "-") {
                    if (a1 == null) {
                        dnode = new OperatorNode(node.op, node.fn, [da0]);
                    } else if (a1.isConstantNode) {
                        dnode = da0;
                    } else {
                        dnode = new OperatorNode(node.op, node.fn, [da0, da1]);
                    }
                } else if (node.op === "*") { // udv+vdu
                    var vdu = new OperatorNode(node.op, node.fn, [a1, da0]);
                    var udv = new OperatorNode(node.op, node.fn, [a0, da1]);
                    dnode = new OperatorNode("+", "add", [udv, vdu]);
                    dnode = this.fastSimplify(dnode);
                } else if (node.op === "/") { // d(u/v) = (vdu-udv)/v^2
                    var vdu = new OperatorNode("*", "multiply", [a1, da0]);
                    var udv = new OperatorNode("*", "multiply", [a0, da1]);
                    var vduudv = new OperatorNode("-", "subtract", [vdu, udv]);
                    vduudv = this.fastSimplify(vduudv);
                    var vduudvn = this.digestNode(vduudv);
                    var vv = new OperatorNode("^", "pos", [a1, this.node2]);
                    var vvname = this.bindNormalizedExpr(vv.toString());
                    dnode = new OperatorNode("/", "divide", [
                        this.symbolNodeOfString(vduudvn),
                        this.symbolNodeOfString(vvname),
                    ]);
                } else if (node.op === "^") {
                    var exponent = a1;
                    var dexponent = da1;
                    if (exponent.isSymbolNode) {
                        var symNode = this.symbolTreeMap[exponent.name];
                        exponent = symNode || exponent;
                    }
                    if (exponent != a1) {
                        dexponent = this.nodeDerivative(exponent, variable);
                    }
                    if (exponent.isConstantNode) {
                        var power = new ConstantNode(Number(exponent.value) - 1);
                        var a0p = new OperatorNode("^", "pow", [a0, power]);
                        var prod = new OperatorNode("*", "multiply", [exponent, a0p]);
                        prod = this.fastSimplify(prod);
                        var prodn = this.bindNormalizedExpr(prod.toString());
                        var prodnn = this.symbolNodeOfString(prodn);
                        dnode = new OperatorNode("*", "multiply", [prodnn, da0]);
                    } else { // d(u^v) = (u^v)*dv*ln(u) + (u^(g-1))*vdu
                        var uv = node;
                        var u = a0;
                        var v = a1;
                        var dv = da1;
                        var du = da0;
                        var lnu = new FunctionNode("ln", [u]);
                        var dvlnu = new OperatorNode("*", "multiply", [dv, lnu]);
                        var uvdvlnu = new OperatorNode("*", "multiply", [uv, dvlnu]);
                        var uvdvlnun = this.digestNode(this.fastSimplify(uvdvlnu));
                        var v1 = new OperatorNode("-", "subtract", [v, this.node1]);
                        var uv1 = new OperatorNode("^", "pow", [u, v1]);
                        var vdu = new OperatorNode("*", "multiply", [v, du]);
                        var uv1vdu = new OperatorNode("*", "multiply", [uv1, vdu]);
                        var uv1vdun = this.digestNode(this.fastSimplify(uv1vdu));
                        dnode = new OperatorNode("+", "add", [
                            this.symbolNodeOfString(uvdvlnun),
                            this.symbolNodeOfString(uv1vdun),
                        ]);
                    }
                }
            } else if (node.isFunctionNode) {
                var a0 = node.args[0];
                var da0 = a0 && this.nodeDerivative(a0, variable);
                var a1 = node.args[1];
                var da1 = a1 && this.nodeDerivative(a1, variable);
                if (node.name === "sin") {
                    var cos = new FunctionNode("cos", [a0]);
                    var fcos = this.bindNormalizedExpr(cos.toString());
                    var fcosn = this.symbolNodeOfString(fcos);
                    dnode = new OperatorNode("*", "multiply", [fcosn, da0]);
                } else if (node.name === "cos") {
                    var cos = new FunctionNode("sin", [a0]);
                    var fcos = this.bindNormalizedExpr(cos.toString());
                    var fcosn = this.symbolNodeOfString(fcos);
                    var dcos = new OperatorNode("-", "unaryMinus", [fcosn]);
                    dnode = new OperatorNode("*", "multiply", [dcos, da0]);
                } else if (node.name === "tan") {
                    var sec = new FunctionNode("sec", [a0]);
                    var sec2 = new OperatorNode("^", "pow", [sec, this.node2]);
                    var fsec2 = this.bindNormalizedExpr(sec2.toString());
                    var fsec2n = this.symbolNodeOfString(fsec2);
                    dnode = new OperatorNode("*", "multiply", [fsec2n, da0]);
                } else if (node.name === "sinh") {
                    var cosh = new FunctionNode("cosh", [a0]);
                    var fcosh = this.bindNormalizedExpr(cosh.toString());
                    var fcoshn = this.symbolNodeOfString(fcosh);
                    dnode = new OperatorNode("*", "multiply", [fcoshn, da0]);
                } else if (node.name === "cosh") {
                    var sinh = new FunctionNode("sinh", [a0]);
                    var fsinh = this.bindNormalizedExpr(sinh.toString());
                    var fsinhn = this.symbolNodeOfString(fsinh);
                    dnode = new OperatorNode("*", "multiply", [fsinhn, da0]);
                } else if (node.name === "tanh") {
                    var sech = new FunctionNode("sech", [a0]);
                    var sech2 = new OperatorNode("^", "pow", [sech, this.node2]);
                    var fsech2 = this.bindNormalizedExpr(sech2.toString());
                    var fsech2n = this.symbolNodeOfString(fsech2);
                    dnode = new OperatorNode("*", "multiply", [fsech2n, da0]);
                } else if (node.name === "sqrt") {
                    var k = new ConstantNode(1 / 2);
                    var power = new ConstantNode(1 / 2 - 1);
                    var a0p = new OperatorNode("^", "pow", [a0, power]);
                    var prod = new OperatorNode("*", "multiply", [k, a0p]);
                    var prodn = this.bindNormalizedExpr(prod.toString());
                    var prodnn = this.symbolNodeOfString(prodn);
                    dnode = new OperatorNode("*", "multiply", [prodnn, da0]);
                } else if (node.name === "exp") { // d(exp(g)) = d(g) * exp(g)
                    dnode = new OperatorNode("*", "multiply", [da0, a0]);
                } else {
                    throw new Error("TBD derivative(" + node.name + ")");
                }
            }
            if (dnode == null) {
                throw new Error("nodeDerivative does not support: " + node.type + " " + msg);
            }
            dnode = this.fastSimplify(dnode);
            if (dnode.isOperatorNode && dnode.args.length === 2) {
                var argn = dnode.args.map((arg) => this.digestNode(arg));
                var args = argn.map((an) => this.symbolNodeOfString(an));
                dnode = new OperatorNode(dnode.op, dnode.fn, args);
            }
            return dnode;
        }

        digestNode(node) {
            var result = null;
            if (node.isConstantNode) {
                result = node.value;
            } else if (node.isSymbolNode) {
                result = node.name;
            } else if (node.isOperatorNode) {
                if (node.args.length === 1) {
                    result = this.bindNormalizedExpr(node.op + this.digestNode(node.args[0]));
                } else if (node.args.length > 1) {
                    if (node.op === "*" && node.args.length === 2 && node.args[1].isConstantNode) {
                        var args = node.args.map((arg) => this.digestNode(arg));
                        var expr = args[1] + " " + node.op + " " + args[0];
                        result = this.bindNormalizedExpr(expr); // constants on the left
                    } else {
                        var args = node.args.map((arg) => this.digestNode(arg));
                        var expr = args.join(" " + node.op + " ");
                        result = this.bindNormalizedExpr(expr);
                    }
                } else {
                    throw new Error("TBD OperatorNode with args:" + node.args.length);
                }
            } else if (node.isFunctionNode) {
                var args = node.args.map((arg) => this.digestNode(arg));
                result = this.bindNormalizedExpr(node.name + "(" + args.join(",") + ")");
            } else if (node.isParenthesisNode) {
                var content = this.digestNode(node.content);
                result = this.bindNormalizedExpr(content.toString());
            } else {
                throw new Error("TBD digestNode(" + node.type + ")");
            }

            if (typeof result !== "string") {
                throw new Error("DEBUG intenal" + node.type);
            }
            return result;
        }

        bindNormalizedExpr(normalizedExpr, defaultSymbol) {
            var symbol = this.symbolExprMap[normalizedExpr];
            if (symbol == null) {
                var digestedNode = mathjs.parse(normalizedExpr);
                if (digestedNode.isConstantNode) {
                    return digestedNode.value; // constants are literals
                } else if (digestedNode.isSymbolNode && digestedNode.name[0] === '_') {
                    return digestedNode.name; // generated symbol
                }
                symbol = defaultSymbol || this.generateSymbol();
                this.bindNode(symbol, digestedNode);
            }
            return symbol;
        }

        undigestNode(node) {
            if (node.isConstantNode) {
                return node;
            } else if (node.isSymbolNode) {
                var tree = this.symbolTreeMap[node.name];
                return node.name[0] === "_" && this.undigestNode(tree) || node;
            } else if (node.isOperatorNode) {
                return new OperatorNode(node.op, node.fn,
                    node.args.map((n) => this.undigestNode(n))
                );
            } else if (node.isFunctionNode) {
                return new FunctionNode(node.name,
                    node.args.map((n) => this.undigestNode(n))
                );
            } else if (node.isParenthesisNode) {
                return new ParenthesisNode(this.undigestNode(node.content));
            } else {
                throw new Error("TBD undigest" + node.toString() + " " + node.type);
            }
        }

        define(symbol, expr) {
            if (typeof symbol !== "string") {
                throw new Error("Invalid call to define(symbol, expr) => symbol must be string");
            }
            if (typeof expr === "number") {
                expr = "" + expr;
            } else if (typeof expr !== "string") {
                throw new Error("Invalid call to define(\"" + symbol + "\", expr) => expr must be string");
            }
            var tree = mathjs.parse(expr);
            if (tree.isConstantNode) {
                this.bindNode(symbol, tree);
            } else {
                var digestedSym = this.digestNode(tree);
                var digestedSymNode = new SymbolNode(digestedSym);
                this.bindNode(symbol, digestedSymNode);
                this.symbolExprMap[this.exprSymbolMap[digestedSym]] = symbol; // prefer user symbol to generated symbol
            }
            return symbol;
        }

        set(symbol, expr) {
            console.log("DEPRECATED: set => define(" + symbol + "," + expr + ")");
            return this.define(symbol, expr);
        }

        get(symbol) {
            console.log("DEPRECATED: get => lookup(" + symbol + ")");
            return this.lookup(symbol);
        }

        lookup(symbol) {
            var node = this.symbolTreeMap[symbol];
            if (node == null) {
                return symbol; // undefined symbol is just itself
            }
            var tree = this.undigestNode(node);
            tree = this.simplify(tree);
            if (!tree) {
                throw new Error("undigest(" + symbol + ") failed:");
            }
            return this.simplify(tree).toString();
        }

        treeOfSymbol(symbol) {
            var tree = this.symbolTreeMap[symbol];
            if (tree == null) {
                var value = Number(symbol);
                if (value) {
                    tree = new ConstantNode(value);
                    this.symbolTreeMap[symbol] = tree;
                }
            }
            return tree;
        }

        compile() {
            var body = "";
            var isConstant = (name) => '0' <= name[0] && name[0] <= '9' || name[0] === '-';
            this.symbols.forEach((symbol) => {
                if (!isConstant(symbol)) {
                    var tree = this.symbolTreeMap[symbol].cloneDeep();
                    tree = tree.transform((node, path, parent) => {
                        if (node.isSymbolNode) {
                            if (!isConstant(node.name)) {
                                node.name = "$." + node.name;
                            }
                        } else if (node.isFunctionNode) {
                            node.fn.name = "math." + node.fn.name;
                        } else if (node.isOperatorNode && node.op === "^") { // Javascript doesn't have "^"
                            return new FunctionNode("math.pow", node.args);
                        }
                        return node;
                    });
                    body += "\n  $." + symbol + " = " + tree.toString() + ";";
                }
            });
            body += "\n  return $;\n";
            var parms = JSON.stringify(this.parameters());
            var evaleq = "function EvalEquations($) {try{" +
                body +
                "}catch(err){throw new Error('Verify parameter values for " + parms + ": '+err.message);}}";
            // use Function to create a function with "math" in its lexical environment
            return (new Function("math", "return " + evaleq))(mathjs);
        }

    } // CLASS

    module.exports = exports.Equations = Equations;
})(typeof exports === "object" ? exports : (exports = {}));