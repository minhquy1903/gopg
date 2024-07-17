package nanoid

import gonanoid "github.com/matoous/go-nanoid/v2"

const ALPHABET_STRING = "abcdefghijklmnopqrstuvwxyz1234567890"

func NewNanoId() string {
	id, _ := gonanoid.Generate(ALPHABET_STRING, 10)

	return id
}
