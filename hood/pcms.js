var PCMS = function(filePath, containerElement) {

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
		var title = new TreeNode('If you are seeing this, your master file is empty');
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
			var lineWrap = document.createElement('div');
			lineWrap.className = 'line-wrap';
			lineWrap.appendChild(document.createElement('br'));
			lineWrap.appendChild(document.createElement('br'));
			parentContainer.appendChild(lineWrap);
		}
		parentContainer.appendChild(childContainer);
		if (height == 1 || height == 2) {
			var lineWrap = document.createElement('div');
			lineWrap.className = 'line-wrap';
			lineWrap.appendChild(document.createElement('br'));
			parentContainer.appendChild(lineWrap);
		}
	};

	get(filePath, function(responseText) {
		var tree = new Tree(responseText);
		render(containerElement, tree.root, 1);
	});
};
