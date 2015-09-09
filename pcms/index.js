var pcms = function(githubUsername, containerElement) {

  //  Cross-browser AJAX
  var get = function(url, callback) {
    try {
      var async = true;
      var x = new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
      x.open('GET', url, async);
      x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      x.onreadystatechange = function() {
        x.readyState > 3 && callback && callback(x.responseText);
      };
      x.send(null);
    } catch (e) {
      window.console && console.log(e);
    }
  };

  var getDirectoryIndex = function(username, callback) {
    document.title = username;
    get('https://api.github.com/repos/'+username+'/'+username+'.github.io/contents/txts', function(response) {
      callback(JSON.parse(response));
    });
  };

  var TreeNode = function(contentStr) {
    var content = contentStr.replace(/\(([^\(]+)\)\[([^\[]+)\]/g, '<a href="$2" target="_blank">$1</a>');
    var children = [];
    this.getContent = function() {
      return content;
    };
    this.addChild = function(node) {
      children.push(node);
    };
    this.getChild = function(idx) {
      return children[idx] || null;
    };
    this.children = function() {
      return children.length;
    };
  };

  var Tree = function(treeStr) {
    var tree = new TreeNode('Error reading file');
    var treeList = treeStr.split(/\r?\n/);
    if (treeList.length > 0) {
      tree = new TreeNode(treeList.shift());
      for (var i = 0; i < treeList.length; i++) {
        if (treeList[i].length !== 0) {
          var topic = new TreeNode(treeList[i]);
          while (++i < treeList.length) {
            if (treeList[i].length === 0) {
              break;
            }
            var argument = new TreeNode(treeList[i]);
            topic.addChild(argument);

          }
          tree.addChild(topic);
        }
      }
    }
    this.root = tree;
  };

  var selectText = function(element) {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {
      document.selection.empty();
    }
  };

  var toggle = function(childContainer) {
    if (childContainer.className == 'closed') {
      childContainer.className = 'open';
      var position = childContainer.getBoundingClientRect();
      var viewportHeight = (window.innerHeight || document.documentElement.clientHeight)
      if (position.bottom > viewportHeight) {
        childContainer.scrollIntoView(false);
      }
    } else if (childContainer.className == 'open') {
      childContainer.className = 'closed';
    }
  };

  var appendNewLine = function(container) {
      var newLine = document.createElement('div');
      newLine.className = 'new-line';
      newLine.appendChild(document.createElement('br'));
      container.appendChild(newLine);
  };

  var render = function(parentContainer, node, pcmsContainer) {
    var content = document.createElement('p');
    content.innerHTML = node.getContent();
    parentContainer.appendChild(content);

    if (parentContainer === pcmsContainer) {
      appendNewLine(parentContainer);
      if (node.children() === 0) {
        appendNewLine(parentContainer);
      }
    }

    if (node.children() === 0) {
      content.className = 'leaf';
    } else {
      var childContainer = document.createElement('div');
      for (var i = 0; i < node.children(); i++) {
        render(childContainer, node.getChild(i), pcmsContainer);
      }
      childContainer.className = 'closed';
      parentContainer.appendChild(childContainer);
      appendNewLine(parentContainer);
      content.addEventListener('click', function(e) {
        if (e.target !== content) {
          return;
        }
        var selectedText = '';
        if (window.getSelection) {
          selectedText = window.getSelection().toString();
        } else if (document.selection && document.selection.type != 'Control') {
          selectedText = document.selection.createRange().text;
        }
        if (selectedText.length === 0) {
          toggle(childContainer);
        }
      });
      content.addEventListener('dblclick', function(e) {
        toggle(childContainer);
        selectText(content);
      });
    }
  };

  // var txts = [
  //   '../content/github.txt',
  //   '../content/linkedin.txt',
  //   '../content/twitter.txt',
  //   '../content/email.txt',
  // ];
  // for (idx in txts) {
  //   get(txts[idx], function(content) {
  //     var pcmsContainer = document.createElement('div');
  //     pcmsContainer.className = 'pcms';

  //     var tree = new Tree(content);
  //     render(pcmsContainer, tree.root, containerElement);

  //     containerElement.appendChild(pcmsContainer);
  //   });
  // }

  getDirectoryIndex(githubUsername, function(directoryIndex) {
    for (var i = 0; i < directoryIndex.length; ++i) {
      if (directoryIndex[i].type == 'file') {

        var pcmsContainer = document.createElement('div');
        pcmsContainer.className = 'pcms';
        containerElement.appendChild(pcmsContainer);

        get(directoryIndex[i].path, function(content) {
          var tree = new Tree(content);
          render(pcmsContainer, tree.root, containerElement);
        });
      }
    }
  });
};
