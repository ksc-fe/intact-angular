export function getParentIntactInstance(searchView, elDef, IntactAngular) {
    var componentProvider = elDef.element.componentProvider;
    if (componentProvider) {
        var nodeIndex = componentProvider.nodeIndex;
        var providerData = searchView.nodes[nodeIndex];
        var instance = providerData.instance;
        if (instance && instance instanceof IntactAngular) {
            return instance;
        }
    }
}
