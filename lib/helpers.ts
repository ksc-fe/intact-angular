export function getParentIntactInstance(searchView, elDef, IntactAngular) {
    const componentProvider = elDef.element.componentProvider;
    if (componentProvider) {
        const nodeIndex = componentProvider.nodeIndex;
        const providerData = searchView.nodes[nodeIndex];
        const instance = providerData.instance;
        if (instance && instance instanceof IntactAngular) {
            return instance; 
        }
    }
}
