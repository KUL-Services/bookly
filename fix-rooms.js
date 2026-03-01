const fs = require('fs');

const path = '/Users/kareemgamal/Downloads/KUL/bookly/src/bookly/features/staff-management/rooms-tab.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the dangling block that is outside of the function.
// We'll locate the string and strictly wipe it.
const danglingBlockStart = `          {/* Render Sessions for Static Rooms */}`;
const danglingBlockEnd = `        </Box>
      </Box>
    )
  }`;
  
// Locate the *second* instance of `</Box>` that matches the end of `renderRoomRow` to inject our block inside.
// A simpler way: Find the exact `) : (` sequence and place it correctly there.
// Instead of complex parsing, I'll just git reset and inject it straight in.
