# crossword-generator

# notes

## data strcutre to store the words in options

lets first consider only for a set number of letters

1. trie

- will have a tree data structure
- blank root node, then all the starting letters on next tier, then two letter pairs, then three, then the full words
- organized left to right by commonness, so if c is the most common starting letter, c will be furtherst left off root node, and so on
- doing it this way we can place one letter at a time
- this way it isn't really sorted by how popular the word is, more so how common the starting letters are, then by popularitiy, or could decide this... figure out. It might be nice, its almost somewhat random now, but sort of in order close enough
- figure out time complexity

2. hash table

- can have something like this "bl" : ["blue", "bled"] ranked by most common first
- also will have "b" : ["blue", "bulb"], etc... with all words starting with b sorted, and same for first three letters
- this way we will place words at a time instead of leters
- can have a seperate hash table, or just do look ups on the fly, or have this hash table in a hash table or sorted, so that if "b" is the most common starting letter, it will be used first

3. array

- don't think this is the way to go
- could just have all the words in a sorted array by commonness
- or could sort alphabetically aaaa first, to zzzz and so on, then have a supplemential map for commonness
- most memory effiecent, but very time consuiming to go through all the array and look for words that start with say "bl"

## general

- once a letter or word is placed, check that all remaining stuff is still possible to have words
- consider caching or memomizing lookup results
- certainly backtracking
- can later make it more complex, like looking ahead say for the second word across
- could maybe go through this dataset (orig.csv) which has a lot of fake words (looks like they built it up from internet searches) and compare each one agianst the actauly dictionary to get only real words with commonness
- important to note that trie and hash table will work well when we are filling in the ends of words from the starts. It will be much harder if we have a middle letter. Important to note when the user could but in anything. It is possible to go to that depth in the tree, then getting that letter, and seeing what is above it, pick the one with the largest tree below it
- I think what we want is fist organized by most occuring, then by commonness.
