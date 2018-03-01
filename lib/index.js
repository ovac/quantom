'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const licenses = require('generator-license').licenses;

const path = require('path');
const semver = require('semver');
const validator = require('validator');
const spawn = require('child_process').spawn;
const giturl = require('git-url-parse');
const shelljs = require('shelljs');

module.exports = class extends Generator {
  /**
  * Constructor
  *
  * @param {String|Array} args Arguments
  * @param {Object} options Options
  */
  constructor(args, options) {
    super(args, options);

    this.shouldRun = options.run;

    // Change the source root directory
    this._sourceRoot = path.join(__dirname, 'templates');
  }

  /**
  * Initializing
  */
  initializing() {
    // If the main stage should be run
    if (this.shouldRun == 'config') {
      this.php = '>=';
      const done = this.async ();
      const child = spawn('php', ['-r', "preg_match('/^\\d+(\\.\\d+)/', PHP_VERSION, $phpVersion); echo $phpVersion[0];"]);
      child.stdout.on('data', chunk => {
        this.php += chunk.toString();
      });
      child.on('close', done);
    }
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the ultimate ${chalk.red('generator-ovac-php')} class set generator!`));

    const dir = path.basename(process.cwd()).split('-', 2);

    const params = [
     {
       type: 'input',
       name: 'inputs',
       message: 'What is the name of this parameter?',
       validate(paramName) {
         return paramName.trim().length
           ? true
           : 'The class name cannot be empty!';
       }
     },
      {
        name: 'paramType',
        message: 'What is the parameter type?',
        default: 'any',
        type: 'list',
        choices: ['any', 'string', 'integer', 'array', 'Class']
      },
     {
       type: 'confirm',
       name: 'another',
       message: "Is there another parameter?",
       default: true
     }
    ]

    const classGen = [
      {
        save: true,
        name: 'className',
        message: `What's the class name?`,
        validate(className) {
          return className.trim().length
            ? true
            : 'The class name cannot be empty!';
        }
      }, {
        save: true,
        name: 'classDescription',
        message: `Please describe the class and what it does?`,
        validate(classDescription) {
          return classDescription.trim().length
            ? true
            : 'The class description cannot be empty!';
        }
      }, {
        save: true,
        name: 'paramName',
        message: `Please enter a parameter name?`,
        validate(paramName) {
          return paramName.trim().length
            ? true
            : 'The parameter name cannot be empty!';
        }
      }, {
        save: true,
        name: 'paramDescription',
        message: `Please enter a parameter description?`,
        validate(paramDescription) {
          return paramDescription.trim().length
            ? true
            : 'The parameter description cannot be empty!';
        }
      }, {
        save: true,
        name: 'paramType',
        message: `What is the parameter type?`,
        type: 'list',
        choices: ['string', 'any', 'array', 'integer', 'Class']
      }
    ];

    const setConfig = [
      {
        save: true,
        name: 'vendor',
        message: `What's the vendor key (e.g. Github profile / organization)?`,
        default: this.config.get('vendor') || dir[0],
        validate(vendor) {
          return vendor.trim().length
            ? true
            : 'The vendor key cannot be empty!';
        }
      }, {
        save: true,
        name: 'project',
        message: `What's the project key?`,
        default: this.config.get('project') || dir[1],
        validate(project) {
          return project.trim().length
            ? true
            : 'The project key cannot be empty!';
        }
      }, {
        save: true,
        name: 'description',
        message: 'Please describe your project',
        default: this.config.get('description') || null,
        validate(description) {
          return description.trim().length
            ? true
            : 'The project description cannot be empty!';
        }
      }, {
        save: true,
        name: 'website',
        message: `What's the project homepage?`,
        default: this.config.get('website') || null,
        validate(url) {
          return (url).length
            ? validator.isURL(url) || 'The project homepage must be a valid URL or empty!'
            : true;
        }
      }, {
        save: true,
        name: 'license',
        message: 'What\'s the project license?',
        default: this.config.get('license') || 'MIT',
        type: 'list',
        choices: licenses
      }, {
        save: true,
        name: 'namespace',
        message: 'What\'s your project\'s main PHP namespace?',
        default: answers => this.config.get('namespace') || (answers.vendor.substr(0, 1).toUpperCase() + answers.vendor.substr(1).toLowerCase()),
        validate(namespace) {
          return (namespace.trim().length && isNamespace(namespace, true)) || 'The project main PHP namespace must be valid!';
        }
      }, {
        save: true,
        name: 'module',
        message: 'What\'s the module name of your project (dash for none)?',
        default: answers => this.config.get('module') || (answers.project.substr(0, 1).toUpperCase() + answers.project.substr(1).toLowerCase()),
        validate: m => (
          (m && m.length)
          ? (isNamespace(m, true) || 'The project module name must be valid or empty!')
          : true),
        filter: m => (
          (m.length && (m.trim() === '-'))
          ? null
          : m)
      }, {
        save: true,
        name: 'authorName',
        message: 'What\'s the author\'s name?',
        default: this.config.get('authorName') || shelljs.exec('git config user.name').output,
        validate(name) {
          return name.trim().length
            ? true
            : 'The author name cannot be empty!';
        }
      }, {
        save: true,
        name: 'authorEmail',
        message: 'What\'s the author\'s email address?',
        default: this.config.get('authorEmail') || shelljs.exec('git config user.email').output,
        validate(email) {
          return (email.trim().length && validator.isEmail(email))
            ? true
            : 'The project author\'s email address must be valid!';
        }
      }, {
        save: true,
        name: 'authorWebsite',
        message: 'What\'s the author\'s website?',
        default: this.config.get('authorWebsite') || null,
        validate(url) {
          return (url.length && validator.isURL(url))
            ? true
            : `The project author's website must be a valid URL!`;
        }
      }, {
        save: true,
        name: 'company',
        message: 'What is your company name for copyright?',
        default: this.config.get('company') || null,
        validate(name) {
          return name.trim().length
            ? true
            : 'The company name cannot be empty!';
        }
      }
    ]



    const mainRun = [
      {
        name: 'stability',
        message: 'What\'s the minimum stability for project dependencies?',
        default: this.config.get('stability') || 'stable',
        type: 'list',
        choices: ['stable', 'RC', 'beta', 'alpha', 'dev']
      }, {
        name: 'php',
        message: 'What\'s the project\'s PHP version requirement?',
        default: this.config.get('php') || this.php,
        validate(version) {
          return (semver.valid(version) || semver.validRange(version))
            ? true
            : 'Please enter a valid semver value (range)!';
        }
      }
    ];

    var prompts = [
      {
        name: 'php',
        message: 'Yo! what\'s up?',
        type: 'list',
        choices: ['cool']
      }
    ];

    if (this.shouldRun === 'config') {
      prompts = prompts.concat(mainRun);
      prompts = prompts.concat(setConfig);
    }

    if (this.shouldRun === 'main') {
      prompts = prompts.concat(classGen);
    }

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = Object.assign(this.config.getAll(), props);
    });
  }

  /**
     * Configuration preparations
     */
  configuring() {

  }

  writing() {
    this.destinationRoot('./');
    
    if (this.shouldRun === 'main') {
      this.fs.copyTpl(this.templatePath('./class/Class.php'), this.destinationPath(`./src/${this.props.className}`), this.props );
      this.fs.copyTpl(this.templatePath('./class/Interface.php'), this.destinationPath(`./src/${this.props.className}Interface.php`), this.props );
      this.fs.copyTpl(this.templatePath('./class/Test.php'), this.destinationPath(`./tests/Unit/Test${this.props.className}`), this.props );
    }
  }

  install() {

  }

  /**
     * End
     */
  end() {

    if (this.shouldRun === 'config') {
      this.config.defaults(this.props);
    }

    if (this.shouldRun === 'config') {
      this.config.defaults(this.props);
    }

    if (this.shouldRun === 'class') {
      this.log(`Class ${this.props.name} Generated successfully`);
      this.log(`Test ${this.props.name} Generated successfully`);
      this.log(`Interface ${this.props.name} Generated successfully`);
    }

  }
};

/**
* Test whether a string is a valid PHP namespace
*
* @param {String} namespace Namespace
* @param {Boolean} empty Namespace may be empty
* @return {Boolean} Namespace is valid
*/
function isNamespace(namespace, empty) {
  if (typeof namespace !== 'string') {
    return false;
  }
  const n = namespace.trim();
  return n.length
    ? /^[A-Z][a-z0-9]*$/.test(n)
    : Boolean(empty);
}

/**
* Test whether a URL is a valid Github repository URL
*
* @param {String} url URL
* @returns {Boolean} Is a valid Github repository URL
*/
function isGithubUrl(url) {
  try {
    const git = giturl(url);
    if (git.resource === 'github.com' && git.owner.length > 0 && git.length > 0) {
      return {ssh: `git@github.com:${git.owner}/${git}.git`, https: `https://github.com/${git.owner}/${git}`}
    }
    return false;
  } catch (e) {
    return false;
  }
}
