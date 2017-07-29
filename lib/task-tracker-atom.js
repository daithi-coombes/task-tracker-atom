'use babel';

import TaskTrackerAtomView from './task-tracker-atom-view';
import { CompositeDisposable } from 'atom';
import request from 'request';
import branch from 'git-branch';

export default {

  subscriptions: null,
  state: {},
  run: false,
  lastBranch: '',

  activate(state) {
    this.state = new TaskTrackerAtomView(state.data);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'task-tracker-atom:toggle': () => this.toggle()
    }));

    this.toggle();

  },

  deactivate() {
    this.subscriptions.dispose();
  },

  /**
   * For persistent state. This value is loaded in `::activate` when atom
   * reloads.
   */
  serialize() {
    return {
      data: this.state.serialize()
    };
  },

  handleError(err){
      console.error('Task Trakcer Atom Error: ', err);
  },

  recordBranch(branch){
      console.log('Branch: ', branch);
      console.log('\t'+new Date());
  },

  /**
   * Get the current git branch, if any.
   * For more git info checkout: https://github.com/rwjblue/git-repo-info/blob/master/index.js
   * @return {Promise} Resolves to String(branchName);
   */
  getBranch(){
      return new Promise((resolve, reject)=>{
          branch((err, str)=>{
              if(err) return reject(err);
              resolve(str);
          });
      });
  },

  toggle() {
      if(this.run) return this.run = false;
      else this.run = true;

      let self = this;

      setInterval(function(){
          console.log('setInterval, run: ', self.run, '('+self.lastBranch+')');
          if(!self.run) return;

          self.getBranch()
              .then((branch)=>{
                  console.log('read branch: ', branch);
                  if(branch!=self.lastBranch){
                      self.lastBranch = branch;
                      return self.recordBranch(branch);
                  }
              })
              .catch((err)=>{
                  return self.handleError(err);
              });
      }, 3000);

      /**
      let editor
      if (editor = atom.workspace.getActiveTextEditor()) {
          this.getBranch()
            .then((branch)=>{
                editor.insertText(branch);
            })
            .catch((err)=>{
                atom.notifications.addWarning(err);
            });
      }
      */
  }

};
