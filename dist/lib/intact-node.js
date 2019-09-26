var IntactNode = /** @class */ (function () {
    function IntactNode() {
        this.props = {};
        this.children = [];
        this.blocks = {};
        this.className = null;
        this.style = null;
    }
    IntactNode.prototype.setProperty = function (name, value) {
        // class has handled in addClass method
        if (name === 'class') {
            this.addClass(value);
        }
        else if (name === 'style') {
            this.initStyle();
            this.style.setAttribute('style', value);
        }
        else {
            this.props[name] = value;
        }
    };
    IntactNode.prototype.removeProperty = function (name) {
        delete this.props[name];
    };
    IntactNode.prototype.addClass = function (name) {
        if (!this.className)
            this.className = Object.create(null);
        this.className[name] = true;
    };
    IntactNode.prototype.removeClass = function (name) {
        if (this.className) {
            delete this.className[name];
        }
    };
    IntactNode.prototype.initStyle = function () {
        if (!this.style)
            this.style = document.createElement('div');
    };
    return IntactNode;
}());
export { IntactNode };
export function isIntactNode(node) {
    return node instanceof IntactNode;
}
