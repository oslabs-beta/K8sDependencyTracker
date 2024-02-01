
const compareController = {};

compareController.compare = (req, res, next) => {
  console.log('Inside of compare controller');
  const kubePug = res.locals.apiInfo;
  const clusterData = res.locals.clusterData;
  //     
  // Iterate through clusterData
  for (const object of clusterData) {
    let found = false;

    // console.log('clusterData Kind: ', object.kind);
    // console.log('object.apiVersion: ', object.apiVersion);
    // console.log('---------------------------');


    if (kubePug.hasOwnProperty(object.kind)) {
      // console.log('clusterData Kind: ', object.kind)
      // console.log('clusterData Version: ', object.apiVersion)
      // console.log('kubePug version: ', kubePug[object.kind].version);
      // console.log('---------------------------');

      if (object.apiVersion === kubePug[object.kind].version) {
        //! MATCH FOUND
        console.log('M A T C H    F O U N D')
        console.log('object.kind: ', object.kind);
        console.log('kubePug[object.kind].version: ', kubePug[object.kind].version)
        console.log('---------------------------');


        // console.log('Length of replacement property: ', Object.values(kubePug[object.kind].replacement).length);

        if (!Object.values(kubePug[object.kind].replacement).length) {
          console.log('DEPRECATED and NO REPLACEMENT');
          //! DEPRECATED & NO REPLACEMENT
          object.kind.deprecationStatus = 'noReplacement';
        }
        else {
          console.log('DEPRECATED with REPLACEMENT AVAILABLE');
          //! DEPRECATED w/ REPLACEMENT AVAILABLE
          object.newVersion = kubePug[object.kind].replacement.version;
        }

        // Add kubePug data properties to clusterData
        object.description = kubePug[object.kind].description;
        // console.log('object.description', object.description)
        object.deprecationStatus = kubePug[object.kind].deprecationStatus;
        found = true;
      }

    }

    // IF not match, make sure clusterData still has appropriate properties
    if (!found) {
      object.newVersion = false;
      object.description = false;
      object.deprecationStatus = 'stable';
    }
  }
  //   console.log('res.locals.clusterData', clusterData)
  return next();
}
// 
module.exports = compareController;