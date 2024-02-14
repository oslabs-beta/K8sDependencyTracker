import { Request, Response, NextFunction } from 'express';

type getUserInput = (req: Request, res: Response, next: NextFunction) => void
type HelmController = {
    getUserInput: getUserInput;
}
type NewObj = {
    name?: string,
    kind?: string,
    apiVersion?: string,
    namespace?: string,
    image?: string
}
// type MatchedData = string[];
type CleanData = NewObj[];

const helmController: HelmController = {

    getUserInput: async (req, res, next) => {

        const childProcess = require('child_process');

        /* 'sh' function will run a child process to execute a command in the user's terminal; the command being a helm install w/ dry-run and debug flags for whatever helm chart the user inputs in the front end. The returned object has a 'manifest' property that represents the .yaml files of that helm chart. We then use a regex expression to parse that data and store into an array. */

        async function installChart(cmd_to_execute: string) {
            console.log('Inside installChart child process');
            return new Promise(function (resolve, reject) {
                childProcess.exec(cmd_to_execute, { maxBuffer: 1024 * 5000 }, (err: any, stdout: any, stderr: any) => {
                    if (err) {
                        console.log('Error occured in installChart child process');
                        console.log(err);
                        return next(err);
                        // reject(err);
                    } else {
                        console.log('No errors in sh function - processing data now');
                        const data = JSON.parse(stdout);

                        const manifest = data.manifest;

                        const regExp = new RegExp('(?=Source: )(.*?)(.yaml)|(?=apiVersion: )(.*?)(?=\\nkind)|(?=kind: )(.*?)(?=\\n)', "gm");

                        const regExpData = manifest.match(regExp);

                        resolve(regExpData);
                    }
                });
            });
        }

        // --------------------------------------------------------------------------------
        // --------------------------------------------------------------------------------
        async function repoProcess(cmd_to_execute: string) {
            console.log('Inside of sh function');
            return new Promise(function (resolve, reject) {
                childProcess.exec(cmd_to_execute, (err: any, stdout: any, stderr: any) => {
                    if (err) {
                        console.log('Error occured repoProcess sh function');
                        reject(err);
                    } else {
                        console.log('No errors in repoProcess function - processing data now');
                        resolve(stdout);
                    }
                });
            });
        }
        // --------------------------------------------------------------------------------
        // --------------------------------------------------------------------------------


        /* Get the user input which is the helm install command copied from a chart repo, like Artifact Hub. Then, reformat the string to include the dry-run and debug flags with a json output at the end. Finally, call the 'sh' function above with the cleaned user input to execute the dry-run chart install */
        //! Update comments to explain checking for and adding + removing repo

        console.log('req.body.helmChartPath: ', req.body.helmChartPath);
        console.log('req.body.helmRepoPath: ', req.body.helmRepoPath);

        // If repo body exists, concat it to terminal command to add (before the dry-run install) and after to delete, else leave both as empty strings
        let addRepo = '';

        // Store user's input and concat to proper syntax for helm install as dry-run in debug mode
        let userInput = req.body.helmChartPath;
        // Remove 'helm install ' from user input then concat it back on with '--dry-run --debug ' and '-o json' at the end
        userInput = userInput.slice(13);
        // userInput = `${addRepo}helm install --dry-run --debug ${userInput} -o json${removeRepo}`;
        userInput = `helm install --dry-run --debug ${userInput} -o json`;


        // If repo is added, run child process before install
        if (req.body.helmRepoPath.length) {
            addRepo = `${req.body.helmRepoPath}`;
            await repoProcess(addRepo);
        }

        const matchedData: any = await installChart(userInput);

        console.log('addRepo: ', addRepo);
        console.log('Cleaned User Input: ', userInput);

        /* Now that we have the raw properties back from the chart install, iterate through that array, creating a new object whenever we hit an element that starts with "Source: ". Populate that object with the next two elements which should be the apiVersion and kind. Then hard code the namespace and image properties which will be default for the dry-run chart installs. This object is in the same format as the object that we persist through our middleware when scanning a users cluster, allowing us to render consistent data on the front end regardless of 'scan' type. */

        const cleanMatchedData: CleanData = [];

        for (let i = 0; i < matchedData.length; i++) {

            // Check for name (aka: 'Source: ')
            if (matchedData[i].slice(0, 3) === 'Sou') {

                const newObj: NewObj = {}

                newObj.name = matchedData[i].slice(8)

                // Check for apiVersion
                if (i + 1 < matchedData.length) {
                    if (matchedData[i + 1].slice(0, 3) === 'api') {
                        newObj.apiVersion = matchedData[i + 1].slice(12);
                        i++;
                    }
                }

                // Check for kind
                if (i + 1 < matchedData.length) {
                    if (matchedData[i + 1].slice(0, 3) === 'kin') {
                        newObj.kind = matchedData[i + 1].slice(6);
                        i++;
                    }
                }

                // Init namespace to 'default' and image to 'placeholder'
                newObj.namespace = 'default';
                newObj.image = 'placeholder';
                cleanMatchedData.push(newObj);
            }
        }
        console.log('cleanMatchedData: ', cleanMatchedData);

        res.locals.helmData = cleanMatchedData;

        return next();
    }
}

module.exports = helmController;
