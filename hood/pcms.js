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

//  Get the GitHub username, either from *.github URL (hack) or from /hood/user.txt
var getUsername = function(callback) {
  var urlParts = window.location.href.substring(window.location.protocol.length+2).split('.');
  if (urlParts[1] == 'github') {
    callback(urlParts[0]);
  } else {
    get('hood/name.txt', function(username) {
      callback(username.split(/\s+/)[0]); //  Regex removes trailing whitespace
    });
  }
};

var getDirectoryIndex = function(username, callback) {
  document.title = username;
  get('https://api.github.com/repos/'+username+'/'+username+'.github.io/contents/txts', function(response) {
    callback(JSON.parse(response));
  });
};

var TreeNode = function(contentStr) {
  var content = contentStr;
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
  var title = new TreeNode('Error reading file');
  var treeList = treeStr.split(/\r?\n/);
  if (treeList.length > 0) {
    title = new TreeNode(treeList.shift());
    document.title = title.getContent();
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
        title.addChild(topic);
      }
    }
  }
  this.root = title;
};

var PCMS = function(contentStr, containerElement) {
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
    if (childContainer.className == 'state-one') {
      childContainer.className = 'state-two';
      var position = childContainer.getBoundingClientRect();
      var viewportHeight = (window.innerHeight || document.documentElement.clientHeight)
      if (position.bottom > viewportHeight) {
        childContainer.scrollIntoView(false);
      }
    } else if (childContainer.className == 'state-two') {
      childContainer.className = 'state-one';
    }
  }

  var lineWrap = function(lines) {
      var lineWrap = document.createElement('div');
      lineWrap.className = 'line-wrap';
      for (var i = 0; i < lines; ++i) {
        lineWrap.appendChild(document.createElement('br'));
      }
      parentContainer.appendChild(lineWrap);
  };

  var render = function(parentContainer, node, height) {
    var content = document.createElement('a');
    content.innerHTML = node.getContent();

    var childContainer = document.createElement('div');
    for (var i = 0; i < node.children(); i++) {
      render(childContainer, node.getChild(i), height + 1);
    }
    if (node.children() > 0) {
      childContainer.className = 'state-one';
      content.addEventListener('click', function() {
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

    parentContainer.appendChild(content);
    if (height == 1) {

    }
    parentContainer.appendChild(childContainer);
    if (height == 1 || height == 2) {
      var lineWrap = document.createElement('div');
      lineWrap.className = 'line-wrap';
      lineWrap.appendChild(document.createElement('br'));
      parentContainer.appendChild(lineWrap);
    }
  };

  var tree = new Tree(contentStr);
  render(containerElement, tree.root, 1);
};

window.onload = function() {
  getUsername(function(username) {
    if (username != 'replace_me_with_your_github_username') {
      getDirectoryIndex(username, function(directoryIndex) {
        var container = document.getElementsByClassName('pcms')[0];
        for (var i = 0; i < directoryIndex.length; ++i) {
          if (directoryIndex[i].type == 'file') {
            get(directoryIndex[i].path, function(content) {
              PCMS(content, container);
            });
          }
        }
      });
    } else {
      PCMS("Please set your username in /hood/username.txt", container);
    }
  });
};
