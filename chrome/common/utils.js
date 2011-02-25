/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Licensed under the GPL Version 2 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 'Missing e' is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 'Missing e'.  If not, see <http://www.gnu.org/licenses/>.
 */

function getPageHeight() {
   var windowHeight;
   if (self.innerHeight) {
      // all except Explorer
      windowHeight = self.innerHeight;
   }
   else if (document.documentElement && document.documentElement.clientHeight) {
      // Explorer 6 Strict Mode
      windowHeight = document.documentElement.clientHeight;
   }
   else if (document.body) {
      // other Explorers
      windowHeight = document.body.clientHeight;
   }
   return windowHeight;
}
