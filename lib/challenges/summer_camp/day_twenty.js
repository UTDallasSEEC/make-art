var palette = require('../../language/modules/palette.json'),
    generate = require('./../util/generate');

module.exports = {
    id          : 'day_twenty',
    title       : 'Fractal Tree',
    short_title : 'Tree',
    icon_class  : 'challenge_tree',
    description : 'Time to play! Our counselors made you something to play with. A tree which can grow branches that expand outwards, and contract inwards. It can blossom fully, or shrivel to nothing. All with code. Make it yours.',
    img         : '/assets/summercamp/ch_pics/day_20.png',
    completion_text: 'Play around with the blue numbers at the top of the code. What do they do? Why do they do that? Shape the tree to your liking. If things mess up, go back to the main menu and start again.',
    difficulty  : 3,
    startAt     : 0,
    summerCamp  : true,
    rewards     : {'outfit': 1},
    code        : '# Play with these blue numbers\narmLength = 50\niterations = 9 # Might crash if you go over 15!\ndegreeChange = 20\nhasBlossoms = 3\nblossomSize = 70\nblossomOpacity = .02\n# ^^^ Play with these blue numbers ^^^\n\n###\nThis is a function that draws a tree\nbranch, when it completes, it calls itself\nover and over and over again until all the\ntree’s branches have been drawn!\n###\ndrawBranch = (x, y, branchesLeft, startAngle) ->\n    if branchesLeft > 0 \n        # Move to where the next branch should\n        # be drawn:\n        moveTo x, y\n        \n        # A branch is always blue, but the width\n        # depends on how far from the base it is!\n        stroke blue, branchesLeft \n        \n        # A bit of trigonometry here, it’s alright\n        # if you don’t understand this! This \n        # calculates coordinates for where the \n        # branch should be drawn to, and where\n        # the next branch should start.\n        dx =  Math.cos(startAngle) * armLength \n        dy = -Math.sin(startAngle) * armLength \n        \n        # Draw a line to the new coordinates we\n        # just calculated\n        line dx, dy \n        \n        # This block of code only executes if\n        # the current branch has blossoms. You\n        # can change the hasBlossoms variable up\n        # top!\n        if branchesLeft <= hasBlossoms \n            # Set the drawing color to a nice red\n            color opacity "rgb(247, 45, 99)", blossomOpacity\n            # Our blossoms shouldn’t have a stroke\n            stroke 0 \n            # Draw the blossom! These big blossoms\n            # overlap over each other to create a\n            # neat effect.\n            circle blossomSize\n        \n        # Starts the next branch on the right\n        drawBranch(x + dx, y + dy, branchesLeft - 1, startAngle - Math.PI / 180 * degreeChange) \n        # Starts the next branch on the left\n        drawBranch(x + dx, y + dy, branchesLeft - 1, startAngle + Math.PI / 180 * degreeChange)\n        \n###\nFinally we call our function and see what\nhappens. Play with the numbers at the top of\nthe function and see how they change the tree\n###\ndrawBranch(stage.width * .5, stage.height, iterations, Math.PI / 2, length)',
    steps       : generate.fromSequence([
    ])
};
